import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, AlertTriangle, Activity, Sliders, Zap, MapPin } from 'lucide-react';

export default function SimulatorTrackSection() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gnssMode, setGnssMode] = useState('auto'); // 'auto', 'blackout', 'locked'
  const [roadNoise, setRoadNoise] = useState('medium'); // 'none', 'medium', 'extreme'
  const [mapMatchingEnabled, setMapMatchingEnabled] = useState(true);
  const [mountAngle, setMountAngle] = useState(25); // degrees
  const [targetSpeed, setTargetSpeed] = useState(60); // km/h

  const [telemetry, setTelemetry] = useState({
    distance: 0,
    speed: 60,
    gnssLocked: true,
    satellites: 12,
    imuDrift: 0,
    aiDrift: 0.8,
    driftPercentage: 2.1,
    statusText: 'GNSS + INS AIDED FUSION',
    statusColor: '#10b981'
  });

  const simState = useRef({
    progress: 0,
    tunnelStart: 0.28,
    tunnelEnd: 0.82,
    rawDriftOffset: { x: 0, y: 0 },
    gpsFrozenAt: null,
    history: []
  });

  const handleReset = () => {
    simState.current.progress = 0;
    simState.current.rawDriftOffset = { x: 0, y: 0 };
    simState.current.gpsFrozenAt = null;
    simState.current.history = [];
    setTelemetry(prev => ({
      ...prev,
      distance: 0,
      imuDrift: 0,
      aiDrift: 0.5,
      driftPercentage: 0.8
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const getRoadPoint = (t, width, height) => {
      const startX = 60;
      const endX = width - 60;
      const x = startX + t * (endX - startX);
      const midY = height * 0.52;
      let y = midY;

      if (t >= 0.25 && t <= 0.85) {
        const tunnelT = (t - 0.25) / 0.6;
        y = midY + Math.sin(tunnelT * Math.PI * 2) * (height * 0.24);
      }

      return { x, y };
    };

    let lastTime = performance.now();

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;

      if (isPlaying) {
        const speedFactor = (targetSpeed / 60) * 0.045;
        simState.current.progress += speedFactor * dt;
        if (simState.current.progress > 1.05) {
          simState.current.progress = 0;
          simState.current.rawDriftOffset = { x: 0, y: 0 };
          simState.current.gpsFrozenAt = null;
          simState.current.history = [];
        }
      }

      const p = Math.min(Math.max(simState.current.progress, 0), 1);
      const inTunnelZone = p >= simState.current.tunnelStart && p <= simState.current.tunnelEnd;

      let isGnssLost = false;
      if (gnssMode === 'blackout') isGnssLost = true;
      else if (gnssMode === 'locked') isGnssLost = false;
      else isGnssLost = inTunnelZone;

      const currentRoad = getRoadPoint(p, width, height);

      const noiseAmp = roadNoise === 'extreme' ? 14 : roadNoise === 'medium' ? 6 : 1;
      const vibrationX = (Math.random() - 0.5) * noiseAmp;
      const vibrationY = (Math.random() - 0.5) * noiseAmp;

      if (isGnssLost) {
        const driftSpeed = 0.85 + (mountAngle / 20) * 0.4;
        simState.current.rawDriftOffset.x += (Math.random() - 0.46) * driftSpeed * 2.8;
        simState.current.rawDriftOffset.y += (0.9 + (Math.random() - 0.5) * 1.5) * driftSpeed * 2.2;
      } else {
        simState.current.rawDriftOffset.x *= 0.94;
        simState.current.rawDriftOffset.y *= 0.94;
      }

      const rawImuPos = {
        x: currentRoad.x + simState.current.rawDriftOffset.x + vibrationX,
        y: currentRoad.y + simState.current.rawDriftOffset.y + vibrationY
      };

      let gpsPos = { x: currentRoad.x, y: currentRoad.y };
      if (isGnssLost) {
        if (!simState.current.gpsFrozenAt) {
          simState.current.gpsFrozenAt = { ...currentRoad };
        }
        gpsPos = {
          x: simState.current.gpsFrozenAt.x + (Math.random() - 0.5) * 4,
          y: simState.current.gpsFrozenAt.y + (Math.random() - 0.5) * 4
        };
      } else {
        simState.current.gpsFrozenAt = null;
      }

      let aiPos = { x: currentRoad.x, y: currentRoad.y };
      let currentAiDrift = 0.5;

      if (isGnssLost) {
        const tunnelProgress = (p - simState.current.tunnelStart) / (simState.current.tunnelEnd - simState.current.tunnelStart);
        
        if (mapMatchingEnabled) {
          currentAiDrift = Math.min(3.2, 0.4 + (tunnelProgress * 2.2) + Math.sin(time * 0.005) * 0.25);
          const laneOffset = (currentAiDrift / 10) * 12;
          aiPos = {
            x: currentRoad.x,
            y: currentRoad.y + laneOffset
          };
        } else {
          currentAiDrift = Math.min(18.0, 1.2 + (tunnelProgress * 14.5));
          aiPos = {
            x: currentRoad.x,
            y: currentRoad.y + (currentAiDrift / 10) * 20
          };
        }
      }

      if (isPlaying) {
        simState.current.history.push({
          road: currentRoad,
          ai: aiPos,
          raw: rawImuPos,
          isBlackout: isGnssLost
        });
        if (simState.current.history.length > 280) {
          simState.current.history.shift();
        }
      }

      // Draw Viewport
      ctx.clearRect(0, 0, width, height);

      // Dark background
      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Tunnel Zone Shading
      const tStartX = width * 0.28;
      const tEndX = width * 0.82;

      const tunnelGrad = ctx.createLinearGradient(tStartX, 0, tEndX, 0);
      tunnelGrad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      tunnelGrad.addColorStop(0.1, 'rgba(3, 7, 18, 0.95)');
      tunnelGrad.addColorStop(0.9, 'rgba(3, 7, 18, 0.95)');
      tunnelGrad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
      ctx.fillStyle = tunnelGrad;
      ctx.fillRect(tStartX, 20, tEndX - tStartX, height - 40);

      // Tunnel border
      ctx.strokeStyle = isGnssLost ? 'rgba(239, 68, 68, 0.5)' : 'rgba(30, 107, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(tStartX, 20, tEndX - tStartX, height - 40);
      ctx.setLineDash([]);

      // Portal text labels
      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('▼ TUNNEL ENTRY [GNSS DENIED ZONE]', tStartX + 10, 38);
      ctx.fillStyle = '#1e6bff';
      ctx.fillText('▲ TUNNEL EXIT (1,000m)', tEndX - 150, 38);

      // Draw Roadway
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#1e293b';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let step = 0; step <= 100; step++) {
        const pt = getRoadPoint(step / 100, width, height);
        if (step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Road Borders
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.stroke();

      // Center dashed line
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      for (let step = 0; step <= 100; step++) {
        const pt = getRoadPoint(step / 100, width, height);
        if (step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw History Trails
      if (simState.current.history.length > 1) {
        // Raw IMU Path (Red dashed)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        simState.current.history.forEach((h, i) => {
          if (i === 0) ctx.moveTo(h.raw.x, h.raw.y);
          else ctx.lineTo(h.raw.x, h.raw.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // iNav Dead Reckoning Path (Vibrant Blue Glow)
        ctx.strokeStyle = '#1e6bff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#1e6bff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        simState.current.history.forEach((h, i) => {
          if (i === 0) ctx.moveTo(h.ai.x, h.ai.y);
          else ctx.lineTo(h.ai.x, h.ai.y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // (A) Standard GPS Frozen indicator
      if (isGnssLost && simState.current.gpsFrozenAt) {
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gpsPos.x, gpsPos.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(gpsPos.x - 16, gpsPos.y);
        ctx.lineTo(gpsPos.x + 16, gpsPos.y);
        ctx.moveTo(gpsPos.x, gpsPos.y - 16);
        ctx.lineTo(gpsPos.x, gpsPos.y + 16);
        ctx.stroke();

        ctx.font = '10px Inter, monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('STANDARD GPS: FROZEN AT PORTAL', gpsPos.x + 20, gpsPos.y + 4);
      }

      // (B) Raw Uncalibrated IMU Marker (Drifting off road)
      if (isGnssLost) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(rawImuPos.x, rawImuPos.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(rawImuPos.x, rawImuPos.y);
        ctx.lineTo(currentRoad.x, currentRoad.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const rawDistanceMeters = Math.hypot(rawImuPos.x - currentRoad.x, rawImuPos.y - currentRoad.y) * 2.8;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`RAW IMU DRIFT: +${rawDistanceMeters.toFixed(0)}m`, rawImuPos.x + 12, rawImuPos.y);
      }

      // (C) iNav Vehicle (Locked to Road Lane)
      ctx.save();
      ctx.translate(aiPos.x, aiPos.y);

      const nextP = Math.min(p + 0.01, 1);
      const nextRoad = getRoadPoint(nextP, width, height);
      const heading = Math.atan2(nextRoad.y - currentRoad.y, nextRoad.x - currentRoad.x);
      ctx.rotate(heading);

      // Pulse ring
      ctx.strokeStyle = isGnssLost ? 'rgba(30, 107, 255, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ringRadius = 15 + Math.sin(time * 0.008) * 3;
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Vehicle Icon
      ctx.fillStyle = isGnssLost ? '#1e6bff' : '#10b981';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-9, -8);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-9, 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Vehicle label
      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(
        isGnssLost ? '● iNav (DEAD RECKONING ACTIVE)' : '● iNav (GNSS LOCKED)', 
        aiPos.x - 30, 
        aiPos.y - 24
      );

      ctx.restore();

      // Telemetry state update
      if (Math.random() < 0.15) {
        const coveredMeters = Math.round(p * 1000);
        const imuErr = isGnssLost ? Math.hypot(rawImuPos.x - currentRoad.x, rawImuPos.y - currentRoad.y) * 2.8 : 0.8;
        const driftPct = coveredMeters > 50 ? Math.min(3.8, (currentAiDrift / coveredMeters) * 100) : 0.8;

        setTelemetry({
          distance: coveredMeters,
          speed: Math.round(targetSpeed + (Math.random() - 0.5) * 2),
          gnssLocked: !isGnssLost,
          satellites: isGnssLost ? 0 : 12,
          imuDrift: imuErr.toFixed(1),
          aiDrift: currentAiDrift.toFixed(1),
          driftPercentage: driftPct.toFixed(1),
          statusText: isGnssLost ? 'INS DEAD RECKONING (OSM MATCHING ACTIVE)' : 'GNSS + INS FUSION ACTIVE',
          statusColor: isGnssLost ? '#1e6bff' : '#10b981'
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, gnssMode, roadNoise, mapMatchingEnabled, mountAngle, targetSpeed]);

  return (
    <section id="simulator" style={{
      backgroundColor: '#f8fafc',
      padding: '5rem 0',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <span className="badge-pill badge-pill-light">
              <Activity size={14} /> LIVE TRACK SIMULATOR
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.4vw, 2.75rem)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Entire Vehicle Movement <span style={{ color: '#1e6bff' }}>Along The Track</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Watch the vehicle move along the 1,000-meter highway and enter the underground tunnel. 
            Compare the wild exponential drift of raw smartphone IMU vs iNav's lane-snapped dead reckoning!
          </p>
        </div>

        {/* Simulator Frame Card */}
        <div style={{
          backgroundColor: '#0a0f1d',
          borderRadius: '20px',
          border: '1px solid #1e293b',
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.25)'
        }}>
          
          {/* Top Status & Run Controls */}
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#0d1527',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #1e293b',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: telemetry.statusColor
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: telemetry.statusColor }} />
                <span>{telemetry.statusText}</span>
              </div>

              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Satellites: <strong style={{ color: telemetry.satellites > 0 ? '#10b981' : '#ef4444' }}>{telemetry.satellites}</strong>
              </span>
            </div>

            {/* Play/Pause/Reset buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-blue"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
              </button>
              <button 
                onClick={handleReset}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Restart Vehicle Run"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#070c18' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />

            {/* Inset Legend */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(10, 15, 29, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              pointerEvents: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '16px', height: '3px', backgroundColor: '#1e6bff', display: 'inline-block' }} />
                <span style={{ color: '#fff', fontWeight: 600 }}>iNav (Map-Matched Track)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '16px', height: '2px', backgroundColor: '#ef4444', borderTop: '2px dashed #ef4444', display: 'inline-block' }} />
                <span style={{ color: '#ef4444' }}>Raw MEMS IMU Drift (Uncorrected)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />
                <span style={{ color: '#94a3b8' }}>Standard GPS (Frozen at portal)</span>
              </div>
            </div>
          </div>

          {/* Metric Gauges Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            backgroundColor: '#1e293b'
          }} className="sim-metrics-grid">
            
            <div style={{ backgroundColor: '#0d1527', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Odometer Run</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {telemetry.distance} <span style={{ fontSize: '0.8rem', color: '#1e6bff' }}>m</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0d1527', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Vehicle Speed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {telemetry.speed} <span style={{ fontSize: '0.8rem', color: '#1e6bff' }}>km/h</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0d1527', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>iNav Drift</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                {telemetry.aiDrift} <span style={{ fontSize: '0.8rem' }}>m</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0d1527', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Raw IMU Drift Error</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
                +{telemetry.imuDrift} <span style={{ fontSize: '0.8rem' }}>m</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0d1527', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>ISRO Drift Compliance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {telemetry.driftPercentage}% <span style={{ fontSize: '0.72rem', color: '#10b981' }}>(&lt; 10% Req)</span>
              </div>
            </div>

          </div>

          {/* Interactive Controls Console */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#0a0f1d',
            borderTop: '1px solid #1e293b',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }} className="sim-ctrls-grid">
            
            {/* Control 1: GNSS Outage Mode */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                GNSS Outage Simulator:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  onClick={() => setGnssMode('auto')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: gnssMode === 'auto' ? '#1e6bff' : '#334155',
                    background: gnssMode === 'auto' ? 'rgba(30, 107, 255, 0.2)' : 'transparent',
                    color: gnssMode === 'auto' ? '#fff' : '#94a3b8'
                  }}
                >
                  Tunnel Auto
                </button>
                <button 
                  onClick={() => setGnssMode('blackout')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: gnssMode === 'blackout' ? '#ef4444' : '#334155',
                    background: gnssMode === 'blackout' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: gnssMode === 'blackout' ? '#fff' : '#94a3b8'
                  }}
                >
                  Force Outage
                </button>
              </div>
            </div>

            {/* Control 2: Road Potholes & Vibrations */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Road Pothole Vibrations:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['none', 'medium', 'extreme'].map(level => (
                  <button 
                    key={level}
                    onClick={() => setRoadNoise(level)}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      borderRadius: '6px',
                      border: '1px solid',
                      cursor: 'pointer',
                      borderColor: roadNoise === level ? '#f59e0b' : '#334155',
                      background: roadNoise === level ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                      color: roadNoise === level ? '#fff' : '#94a3b8'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Map Matching */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                OSM Road Map Matching:
              </label>
              <button 
                onClick={() => setMapMatchingEnabled(!mapMatchingEnabled)}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  borderColor: mapMatchingEnabled ? '#10b981' : '#334155',
                  background: mapMatchingEnabled ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: mapMatchingEnabled ? '#10b981' : '#94a3b8'
                }}
              >
                <ShieldCheck size={14} />
                {mapMatchingEnabled ? 'OSM Snapping ON' : 'Free Drift (OFF)'}
              </button>
            </div>

            {/* Control 4: Phone Mount Pitch Angle */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                <span>Mount Angle:</span>
                <span style={{ color: '#38bdf8' }}>{mountAngle}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="60" 
                value={mountAngle} 
                onChange={e => setMountAngle(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1e6bff', cursor: 'pointer' }} 
              />
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Auto-Calibrated by AI
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 980px) {
          .sim-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sim-ctrls-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .sim-metrics-grid { grid-template-columns: 1fr !important; }
          .sim-ctrls-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
