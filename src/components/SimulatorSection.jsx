import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Zap, Radio, Sliders, Eye, EyeOff, MapPin } from 'lucide-react';

export default function SimulatorSection() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gnssMode, setGnssMode] = useState('auto'); // 'auto', 'blackout', 'locked'
  const [roadNoise, setRoadNoise] = useState('medium'); // 'none', 'medium', 'extreme'
  const [mapMatchingEnabled, setMapMatchingEnabled] = useState(true);
  const [mountAngle, setMountAngle] = useState(25); // degrees tilt of phone on dashboard
  const [targetSpeed, setTargetSpeed] = useState(60); // km/h

  // Telemetry state displayed in UI
  const [telemetry, setTelemetry] = useState({
    distance: 0,
    speed: 60,
    gnssLocked: true,
    satellites: 12,
    imuDrift: 0,
    aiDrift: 0.8,
    driftPercentage: 2.1,
    statusText: 'GNSS + INS AIDED FUSION',
    statusColor: 'var(--emerald)'
  });

  // Simulator loop state ref
  const simState = useRef({
    progress: 0, // 0 to 1 along track
    tunnelStart: 0.28,
    tunnelEnd: 0.82,
    rawImuPos: { x: 0, y: 0 },
    rawDriftOffset: { x: 0, y: 0 },
    aiPos: { x: 0, y: 0 },
    gpsGhostPos: { x: 0, y: 0 },
    gpsFrozenAt: null,
    totalDistMeters: 1000,
    history: []
  });

  // Reset simulation
  const handleReset = () => {
    simState.current.progress = 0;
    simState.current.rawDriftOffset = { x: 0, y: 0 };
    simState.current.gpsFrozenAt = null;
    simState.current.history = [];
    setTelemetry(prev => ({
      ...prev,
      distance: 0,
      imuDrift: 0,
      aiDrift: 0.4,
      driftPercentage: 0.8
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Track path geometry: expressway with an S-curve tunnel
    const getRoadPoint = (t, width, height) => {
      // t from 0 to 1
      const startX = 60;
      const endX = width - 60;
      const x = startX + t * (endX - startX);
      
      // Road curvature: gentle S-curve inside tunnel
      const midY = height * 0.52;
      let y = midY;

      if (t >= 0.25 && t <= 0.85) {
        const tunnelT = (t - 0.25) / 0.6;
        y = midY + Math.sin(tunnelT * Math.PI * 2) * (height * 0.22);
      }

      return { x, y };
    };

    let lastTime = performance.now();

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle resize
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

      // Update simulation if playing
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

      // Determine GNSS status
      let isGnssLost = false;
      if (gnssMode === 'blackout') isGnssLost = true;
      else if (gnssMode === 'locked') isGnssLost = false;
      else isGnssLost = inTunnelZone;

      // Calculate positions
      const currentRoad = getRoadPoint(p, width, height);

      // Noise generator
      const noiseAmp = roadNoise === 'extreme' ? 14 : roadNoise === 'medium' ? 6 : 1;
      const vibrationX = (Math.random() - 0.5) * noiseAmp;
      const vibrationY = (Math.random() - 0.5) * noiseAmp;

      // Raw IMU drift accumulates during blackout
      if (isGnssLost) {
        // Exponential drift characteristic of uncorrected MEMS double-integration
        const driftSpeed = 0.85 + (mountAngle / 20) * 0.4;
        simState.current.rawDriftOffset.x += (Math.random() - 0.46) * driftSpeed * 2.8;
        simState.current.rawDriftOffset.y += (0.9 + (Math.random() - 0.5) * 1.5) * driftSpeed * 2.2;
      } else {
        // Fast convergence back to GPS when lock restored
        simState.current.rawDriftOffset.x *= 0.94;
        simState.current.rawDriftOffset.y *= 0.94;
      }

      // Raw IMU position
      const rawImuPos = {
        x: currentRoad.x + simState.current.rawDriftOffset.x + vibrationX,
        y: currentRoad.y + simState.current.rawDriftOffset.y + vibrationY
      };

      // Standard GPS Ghost position (freezes or jumps wildly)
      let gpsPos = { x: currentRoad.x, y: currentRoad.y };
      if (isGnssLost) {
        if (!simState.current.gpsFrozenAt) {
          simState.current.gpsFrozenAt = { ...currentRoad };
        }
        // Jitter around frozen entry point or jump erratically
        gpsPos = {
          x: simState.current.gpsFrozenAt.x + (Math.random() - 0.5) * 4,
          y: simState.current.gpsFrozenAt.y + (Math.random() - 0.5) * 4
        };
      } else {
        simState.current.gpsFrozenAt = null;
      }

      // iNav Position:
      // Combines AI speed prediction + NHC constraint (cross-track velocity = 0) + OSM road snapping
      let aiPos = { x: currentRoad.x, y: currentRoad.y };
      let currentAiDrift = 0.5;

      if (isGnssLost) {
        const tunnelProgress = (p - simState.current.tunnelStart) / (simState.current.tunnelEnd - simState.current.tunnelStart);
        const tunnelDistanceMeters = tunnelProgress * 1000;
        
        if (mapMatchingEnabled) {
          // Lane-level accuracy: remains within 1.2 - 2.5 meters of lane center
          currentAiDrift = Math.min(3.2, 0.4 + (tunnelProgress * 2.4) + Math.sin(time * 0.005) * 0.3);
          const laneOffset = (currentAiDrift / 10) * 12; // pixels
          aiPos = {
            x: currentRoad.x,
            y: currentRoad.y + laneOffset
          };
        } else {
          // Without map-matching, pure kinematic dead reckoning drifts slightly more (~ 8%)
          currentAiDrift = Math.min(18.0, 1.2 + (tunnelProgress * 14.5));
          aiPos = {
            x: currentRoad.x,
            y: currentRoad.y + (currentAiDrift / 10) * 20
          };
        }
      }

      // Store history for smooth trail
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

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      // 1. Background Grid & Terrain
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Subtle tech grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
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

      // 2. Tunnel Boundary Zone
      const tStartX = width * 0.28;
      const tEndX = width * 0.82;

      // Dark mountain tunnel shading
      const tunnelGrad = ctx.createLinearGradient(tStartX, 0, tEndX, 0);
      tunnelGrad.addColorStop(0, 'rgba(15, 23, 42, 0.3)');
      tunnelGrad.addColorStop(0.1, 'rgba(2, 6, 23, 0.92)');
      tunnelGrad.addColorStop(0.9, 'rgba(2, 6, 23, 0.92)');
      tunnelGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
      ctx.fillStyle = tunnelGrad;
      ctx.fillRect(tStartX, 20, tEndX - tStartX, height - 40);

      // Tunnel walls / portals
      ctx.strokeStyle = isGnssLost ? 'rgba(244, 63, 94, 0.6)' : 'rgba(0, 242, 254, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(tStartX, 20, tEndX - tStartX, height - 40);
      ctx.setLineDash([]);

      // Tunnel Portal Labels
      ctx.font = '600 11px Orbitron, sans-serif';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
      ctx.fillText('▼ TUNNEL ENTRY [GNSS DENIED ZONE]', tStartX + 10, 38);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.fillText('▲ TUNNEL EXIT (1000m)', tEndX - 160, 38);

      // 3. Draw Roadway (Ground Truth Lane)
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#172033';
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
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.stroke();

      // Center dashed line
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      for (let step = 0; step <= 100; step++) {
        const pt = getRoadPoint(step / 100, width, height);
        if (step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Draw History Trails
      if (simState.current.history.length > 1) {
        // Raw IMU Drifting Path (Red)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        simState.current.history.forEach((h, i) => {
          if (i === 0) ctx.moveTo(h.raw.x, h.raw.y);
          else ctx.lineTo(h.raw.x, h.raw.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // iNav Dead Reckoning Path (Cyan Glowing)
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        simState.current.history.forEach((h, i) => {
          if (i === 0) ctx.moveTo(h.ai.x, h.ai.y);
          else ctx.lineTo(h.ai.x, h.ai.y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 5. Draw Target Indicators

      // (A) Standard GPS Frozen indicator (if blackout)
      if (isGnssLost && simState.current.gpsFrozenAt) {
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gpsPos.x, gpsPos.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(gpsPos.x - 18, gpsPos.y);
        ctx.lineTo(gpsPos.x + 18, gpsPos.y);
        ctx.moveTo(gpsPos.x, gpsPos.y - 18);
        ctx.lineTo(gpsPos.x, gpsPos.y + 18);
        ctx.stroke();

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('STANDARD GPS: SIGNAL LOST', gpsPos.x + 22, gpsPos.y + 4);
      }

      // (B) Raw Uncalibrated IMU Dot (Wildly drifting off road)
      if (isGnssLost) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(rawImuPos.x, rawImuPos.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Drift vector line to actual road
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(rawImuPos.x, rawImuPos.y);
        ctx.lineTo(currentRoad.x, currentRoad.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const rawDistanceMeters = Math.hypot(rawImuPos.x - currentRoad.x, rawImuPos.y - currentRoad.y) * 2.8;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`RAW IMU DRIFT: +${rawDistanceMeters.toFixed(0)}m`, rawImuPos.x + 12, rawImuPos.y);
      }

      // (C) iNav Vehicle (Snaps to Lane)
      ctx.save();
      ctx.translate(aiPos.x, aiPos.y);

      // Vehicle Heading Angle
      const nextP = Math.min(p + 0.01, 1);
      const nextRoad = getRoadPoint(nextP, width, height);
      const heading = Math.atan2(nextRoad.y - currentRoad.y, nextRoad.x - currentRoad.x);
      ctx.rotate(heading);

      // Pulse ring
      ctx.strokeStyle = isGnssLost ? 'rgba(0, 242, 254, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ringRadius = 16 + Math.sin(time * 0.008) * 3;
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Vehicle Body
      ctx.fillStyle = isGnssLost ? '#00f2fe' : '#10b981';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-10, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 9);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Label on vehicle
      ctx.font = '600 11px Orbitron, sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.fillText(
        isGnssLost ? '● iNav (DEAD RECKONING)' : '● iNav (GNSS AIDED)', 
        aiPos.x - 30, 
        aiPos.y - 25
      );

      ctx.restore();

      // Update telemetry readouts at ~10Hz
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
          statusText: isGnssLost 
            ? 'INS DEAD RECKONING (OSM + NHC ACTIVE)' 
            : 'GNSS + INS AIDED FUSION',
          statusColor: isGnssLost ? 'var(--cyan)' : 'var(--emerald)'
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, gnssMode, roadNoise, mapMatchingEnabled, mountAngle, targetSpeed]);

  return (
    <section id="simulator" style={{
      padding: '5rem 0',
      position: 'relative',
      background: 'linear-gradient(to bottom, var(--bg-primary), #0a0f1d 50%, var(--bg-primary))'
    }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
          <div className="badge-tech" style={{ marginBottom: '0.8rem' }}>
            <Zap size={14} /> Interactive Physics & Sensor Fusion Sandbox
          </div>
          <h2 className="heading-font" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', color: '#fff', marginBottom: '1rem' }}>
            Experience Seamless Navigation in <span className="text-gradient-cyan">GNSS Outage</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Watch consumer smartphone MEMS IMU sensors track vehicle position through a 1,000-meter underground tunnel. 
            Compare uncorrected IMU drift vs. iNav's Non-Holonomic kinematic constraints.
          </p>
        </div>

        {/* Simulator Card */}
        <div className="glass-panel" style={{
          border: '1px solid rgba(0, 242, 254, 0.25)',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}>
          
          {/* Top Live Telemetry Status Bar */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'rgba(11, 17, 32, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
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
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem'
              }}>
                <div className="pulse-dot" style={{ backgroundColor: telemetry.statusColor }} />
                <span style={{ color: telemetry.statusColor, fontWeight: 700 }}>
                  {telemetry.statusText}
                </span>
              </div>

              <span className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Satellites: <strong style={{ color: telemetry.satellites > 0 ? 'var(--emerald)' : 'var(--rose)' }}>{telemetry.satellites}</strong>
              </span>
            </div>

            {/* Quick Play/Pause & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-secondary" 
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
              </button>
              <button 
                onClick={handleReset}
                className="btn-secondary" 
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                title="Restart Vehicle Run"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div style={{ position: 'relative', width: '100%', height: '420px', background: '#050811' }}>
            <canvas 
              ref={canvasRef} 
              style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} 
            />

            {/* Inset Legend Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(6, 9, 17, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              pointerEvents: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '16px', height: '3px', backgroundColor: '#00f2fe', display: 'inline-block', boxShadow: '0 0 6px #00f2fe' }} />
                <span style={{ color: '#fff', fontWeight: 600 }}>iNav Dead Reckoning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '16px', height: '2px', backgroundColor: '#f43f5e', borderTop: '2px dashed #f43f5e', display: 'inline-block' }} />
                <span style={{ color: '#f43f5e' }}>Raw MEMS IMU Drift (Uncorrected)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />
                <span style={{ color: '#94a3b8' }}>Standard GPS (Frozen at entry)</span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Metrics Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            background: 'var(--border-subtle)',
            borderTop: '1px solid var(--border-subtle)'
          }} className="sim-telemetry-grid">
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Odometer Run</div>
              <div className="heading-font" style={{ fontSize: '1.35rem', color: '#fff', marginTop: '0.2rem' }}>
                {telemetry.distance} <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>m</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Predicted Speed</div>
              <div className="heading-font" style={{ fontSize: '1.35rem', color: '#fff', marginTop: '0.2rem' }}>
                {telemetry.speed} <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>km/h</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>iNav Drift</div>
              <div className="heading-font" style={{ fontSize: '1.35rem', color: 'var(--emerald)', marginTop: '0.2rem' }}>
                {telemetry.aiDrift} <span style={{ fontSize: '0.8rem' }}>m</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raw IMU Drift Error</div>
              <div className="heading-font" style={{ fontSize: '1.35rem', color: 'var(--rose)', marginTop: '0.2rem' }}>
                +{telemetry.imuDrift} <span style={{ fontSize: '0.8rem' }}>m</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ISRO Drift Compliance</div>
              <div className="heading-font" style={{ fontSize: '1.35rem', color: 'var(--cyan)', marginTop: '0.2rem' }}>
                {telemetry.driftPercentage}% <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>(&lt; 10% Req)</span>
              </div>
            </div>

          </div>

          {/* Interactive Simulation Controls Console */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(10, 15, 27, 0.98)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }} className="sim-controls-grid">

            {/* Control 1: GNSS Satellite Outage Mode */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
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
                    borderColor: gnssMode === 'auto' ? 'var(--cyan)' : 'var(--border-subtle)',
                    background: gnssMode === 'auto' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                    color: gnssMode === 'auto' ? '#fff' : 'var(--text-secondary)'
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
                    borderColor: gnssMode === 'blackout' ? 'var(--rose)' : 'var(--border-subtle)',
                    background: gnssMode === 'blackout' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                    color: gnssMode === 'blackout' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Force Blackout
                </button>
              </div>
            </div>

            {/* Control 2: Road Potholes & Vibrations */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Road Potholes & Vibration Noise:
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
                      borderColor: roadNoise === level ? 'var(--isro-orange)' : 'var(--border-subtle)',
                      background: roadNoise === level ? 'rgba(255, 119, 0, 0.2)' : 'transparent',
                      color: roadNoise === level ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: AI Map-Matching & NHC */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Map-Matching & NHC Constraints:
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
                  gap: '0.5rem',
                  borderColor: mapMatchingEnabled ? 'var(--emerald)' : 'var(--border-subtle)',
                  background: mapMatchingEnabled ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: mapMatchingEnabled ? 'var(--emerald)' : 'var(--text-secondary)'
                }}
              >
                <ShieldCheck size={14} />
                {mapMatchingEnabled ? 'OSM Snapping ACTIVE' : 'Snapping OFF (Free Drift)'}
              </button>
            </div>

            {/* Control 4: Phone Mount Tilt Angle */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Dashboard Mount Pitch Tilt:
                </label>
                <span className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{mountAngle}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="60" 
                value={mountAngle} 
                onChange={e => setMountAngle(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }} 
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Auto-Calibrated to Vehicle Driving Axis
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .sim-telemetry-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sim-controls-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .sim-telemetry-grid { grid-template-columns: 1fr !important; }
          .sim-controls-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
