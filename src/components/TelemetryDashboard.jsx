import React, { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, GitCommit, Layers, SlidersHorizontal, TrendingUp } from 'lucide-react';

export default function TelemetryDashboard() {
  const accelCanvasRef = useRef(null);
  const gyroCanvasRef = useRef(null);
  const [filterMode, setFilterMode] = useState('filtered'); // 'raw', 'filtered', 'both'

  useEffect(() => {
    const accelCanvas = accelCanvasRef.current;
    const gyroCanvas = gyroCanvasRef.current;
    if (!accelCanvas || !gyroCanvas) return;

    const ctxA = accelCanvas.getContext('2d');
    const ctxG = gyroCanvas.getContext('2d');
    let animId;

    let timeStep = 0;
    const historyA = [];
    const historyG = [];
    const maxPoints = 120;

    const render = () => {
      timeStep += 0.08;

      // Generate realistic vehicle kinematics with road vibration
      const baseAccel = Math.sin(timeStep * 0.4) * 1.8; // smooth forward acceleration
      const engineHarmonics = Math.sin(timeStep * 3.8) * 0.9;
      const potholeSpike = Math.random() < 0.04 ? (Math.random() - 0.5) * 6.5 : 0;
      const rawAccel = baseAccel + engineHarmonics + potholeSpike + (Math.random() - 0.5) * 1.2;
      const aiFilteredAccel = baseAccel + Math.sin(timeStep * 0.4 + 0.1) * 0.1; // clean predicted forward acceleration

      // Gyroscope yaw rate
      const baseYaw = Math.cos(timeStep * 0.3) * 0.8;
      const roadJolt = (Math.random() - 0.5) * 0.7;
      const rawGyro = baseYaw + roadJolt;
      const aiFilteredGyro = baseYaw;

      historyA.push({ raw: rawAccel, filtered: aiFilteredAccel });
      if (historyA.length > maxPoints) historyA.shift();

      historyG.push({ raw: rawGyro, filtered: aiFilteredGyro });
      if (historyG.length > maxPoints) historyG.shift();

      // Render Accelerometer Canvas
      const renderWaveform = (ctx, canvas, history, yLabel, unit, yRange) => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
        }
        ctx.save();
        ctx.scale(dpr, dpr);
        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#060a14';
        ctx.fillRect(0, 0, w, h);

        // Center zero line
        const midY = h / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();

        // Horizontal grid
        [-yRange/2, yRange/2].forEach(val => {
          const y = midY - (val / yRange) * (h * 0.75);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        });

        const stepX = w / (maxPoints - 1);

        // 1. Raw noisy wave (Red/Orange)
        if (filterMode === 'raw' || filterMode === 'both') {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          history.forEach((pt, i) => {
            const x = i * stepX;
            const y = midY - (pt.raw / yRange) * (h * 0.4);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }

        // 2. AI Kinematic Filtered wave (Cyan Glowing)
        if (filterMode === 'filtered' || filterMode === 'both') {
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          history.forEach((pt, i) => {
            const x = i * stepX;
            const y = midY - (pt.filtered / yRange) * (h * 0.4);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Live value tag
        const lastVal = history[history.length - 1];
        if (lastVal) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#00f2fe';
          ctx.fillText(`AI: ${lastVal.filtered.toFixed(2)} ${unit}`, w - 110, 20);
          ctx.fillStyle = '#f43f5e';
          ctx.fillText(`RAW: ${lastVal.raw.toFixed(2)} ${unit}`, w - 110, 35);
        }

        ctx.restore();
      };

      renderWaveform(ctxA, accelCanvas, historyA, 'Acceleration', 'm/s²', 8);
      renderWaveform(ctxG, gyroCanvas, historyG, 'Yaw Rate', 'rad/s', 3);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [filterMode]);

  return (
    <section style={{
      padding: '4rem 0',
      background: 'var(--bg-primary)',
      borderTop: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="badge-tech" style={{ marginBottom: '0.6rem' }}>
              <Cpu size={14} /> Edge Deep Learning Signal Processing
            </div>
            <h2 className="heading-font" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', color: '#fff' }}>
              AI Kinematic Speed & Vibration Filtering
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.4rem' }}>
              Standard integration of raw smartphone accelerometer data diverges immediately due to engine harmonics, chassis pitch, and road bumps. 
              iNav's 1D-CNN + Kalman state filter estimates true forward speed directly from micro-vibration spectra.
            </p>
          </div>

          {/* Filter selector toggle */}
          <div style={{
            display: 'flex',
            padding: '4px',
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            {[
              { id: 'both', label: 'Overlay (Raw + AI)' },
              { id: 'filtered', label: 'AI Filtered Only' },
              { id: 'raw', label: 'Raw MEMS IMU' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterMode === tab.id ? 'var(--cyan)' : 'transparent',
                  color: filterMode === tab.id ? '#030712' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Waveforms & Mathematical Fusion Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }} className="telemetry-grid">
          
          {/* Left: Waveforms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Accelerometer Waveform Card */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Activity size={18} color="var(--cyan)" />
                  <span className="heading-font" style={{ fontSize: '0.9rem', color: '#fff' }}>
                    FORWARD ACCELEROMETER kin_accel [X-Axis]
                  </span>
                </div>
                <span className="mono-font" style={{ fontSize: '0.72rem', color: 'var(--emerald)' }}>
                  HARMONIC ATTENUATION: 98.6%
                </span>
              </div>
              <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                <canvas ref={accelCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </div>

            {/* Gyroscope Waveform Card */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <TrendingUp size={18} color="var(--blue)" />
                  <span className="heading-font" style={{ fontSize: '0.9rem', color: '#fff' }}>
                    VEHICLE YAW RATE GYRO [Z-Axis]
                  </span>
                </div>
                <span className="mono-font" style={{ fontSize: '0.72rem', color: 'var(--cyan)' }}>
                  DRIFT BIAS COMPENSATED: ±0.002 rad/s
                </span>
              </div>
              <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                <canvas ref={gyroCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </div>

          </div>

          {/* Right: Technical Math & Constraint Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="badge-tech badge-isro" style={{ marginBottom: '1rem' }}>
                Mathematical Formulation
              </div>

              <h3 className="heading-font" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>
                Non-Holonomic Constraints (NHC)
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                A ground vehicle rolling without slip satisfies zero lateral and vertical velocity relative to its driving chassis. 
                iNav enforces virtual measurement updates every 100ms:
              </p>

              {/* Math equation box */}
              <div style={{
                background: 'rgba(6, 9, 17, 0.9)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'var(--cyan)',
                marginBottom: '1.2rem'
              }}>
                <div>v<sub>lateral</sub> ≈ 0 + v<sub>noise</sub></div>
                <div>v<sub>vertical</sub> ≈ 0 + w<sub>noise</sub></div>
                <div style={{ color: 'var(--emerald)', marginTop: '0.4rem', fontSize: '0.78rem' }}>
                  // Eliminates exponential sideways drift during GNSS outages
                </div>
              </div>

              <h4 className="heading-font" style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>
                Extended Kalman Covariance (P[k|k])
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Velocity Variance ($\sigma_v$)</div>
                  <div className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--emerald)', fontWeight: 700 }}>0.14 m/s</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Position Uncertainty</div>
                  <div className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--cyan)', fontWeight: 700 }}>± 1.82 m</div>
                </div>
              </div>
            </div>

            {/* Bottom status */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.06)',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <GitCommit size={16} color="var(--cyan)" />
              <span>Offline OSM geometric vectors lock heading to the exact roadway lane.</span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 980px) {
          .telemetry-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
