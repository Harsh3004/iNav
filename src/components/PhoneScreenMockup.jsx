import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Crosshair, Map, Layers, Wifi, Battery, Signal } from 'lucide-react';

export default function PhoneScreenMockup() {
  const [tunnelMode, setTunnelMode] = useState(true);
  const [speed, setSpeed] = useState(52);
  const [isTripActive, setIsTripActive] = useState(true);
  const [satellites, setSatellites] = useState(0);
  const [drift, setDrift] = useState('1.2m');
  const canvasRef = useRef(null);

  // Randomize telemetry for realism
  useEffect(() => {
    if (!isTripActive) return;
    const iv = setInterval(() => {
      setSpeed(48 + Math.floor(Math.random() * 10));
      setDrift((0.8 + Math.random() * 1.2).toFixed(1) + 'm');
      if (!tunnelMode) setSatellites(10 + Math.floor(Math.random() * 4));
      else setSatellites(0);
    }, 1200);
    return () => clearInterval(iv);
  }, [isTripActive, tunnelMode]);

  // Animated perspective tunnel road canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;
    let time = 0;

    const render = () => {
      time += 0.035;
      if (isTripActive) offset = (offset + 0.04) % 1;

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

      // Dark tunnel env
      ctx.fillStyle = '#050a16';
      ctx.fillRect(0, 0, w, h);

      const vpX = w * 0.54;
      const vpY = h * 0.32;

      // Tunnel concrete arch rings
      const rings = 8;
      for (let i = rings; i >= 1; i--) {
        const prog = (i - 1 + offset) / rings;
        const ringW = 60 + prog * prog * (w * 0.9);
        const ringH = 35 + prog * prog * (h * 0.85);

        ctx.strokeStyle = `rgba(245,158,11,${0.1 + prog * 0.5})`;
        ctx.lineWidth = 1.5 + prog * 1.5;
        ctx.beginPath();
        ctx.ellipse(vpX, vpY + prog * 15, ringW / 2, ringH / 2, 0, Math.PI, 0, false);
        ctx.stroke();

        // Sodium lamps
        ctx.fillStyle = '#ffb703';
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 6 * prog;
        ctx.beginPath();
        ctx.arc(vpX - ringW * 0.38, vpY + prog * 15 - ringH * 0.42, 2.5 * prog + 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vpX + ringW * 0.38, vpY + prog * 15 - ringH * 0.42, 2.5 * prog + 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Asphalt road
      ctx.fillStyle = '#0d1527';
      ctx.beginPath();
      ctx.moveTo(vpX - 25, vpY + 5);
      ctx.lineTo(vpX + 25, vpY + 5);
      ctx.lineTo(w * 0.95, h);
      ctx.lineTo(w * 0.05, h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vpX - 25, vpY + 5);
      ctx.lineTo(w * 0.05, h);
      ctx.moveTo(vpX + 25, vpY + 5);
      ctx.lineTo(w * 0.95, h);
      ctx.stroke();

      // Center dashed lines
      ctx.strokeStyle = 'rgba(255,255,255,0.38)';
      ctx.lineWidth = 2;
      const numDashes = 6;
      for (let d = 0; d < numDashes; d++) {
        const dp = (d + offset) / numDashes;
        const y1 = vpY + 5 + dp * dp * (h - vpY);
        const y2 = vpY + 5 + (dp + 0.08) * (dp + 0.08) * (h - vpY);
        ctx.beginPath();
        ctx.moveTo(vpX, y1);
        ctx.lineTo(vpX, y2);
        ctx.stroke();
      }

      // iNav route glow line
      ctx.strokeStyle = '#1e6bff';
      ctx.lineWidth = 9;
      ctx.shadowColor = '#1e6bff';
      ctx.shadowBlur = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(vpX, vpY + 12);
      ctx.quadraticCurveTo(vpX + Math.sin(time * 0.8) * 8, (vpY + h) / 2, vpX, h - 35);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Animated chevron arrow
      const arrowY = h * 0.65 + Math.sin(time * 4) * 6;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(vpX, arrowY - 10);
      ctx.lineTo(vpX - 8, arrowY + 8);
      ctx.lineTo(vpX, arrowY + 3);
      ctx.lineTo(vpX + 8, arrowY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Car ahead taillights
      const carY = vpY + 45;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(vpX - 3, carY, 5, 2);
      ctx.fillRect(vpX + 6, carY, 5, 2);
      ctx.shadowBlur = 0;

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isTripActive]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* Floating side quote */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{ position: 'absolute', top: '18%', right: '-160px', textAlign: 'left', zIndex: 1, pointerEvents: 'none' }}
        className="screen-tunnel-quote"
      >
        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em' }}>SAME ROAD.</div>
        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em' }}>NO SIGNAL.</div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '1.05rem', color: '#1e6bff', fontWeight: 900, letterSpacing: '0.05em' }}
        >
          STILL ON TRACK.
        </motion.div>
      </motion.div>

      {/* Phone outer glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: -20, borderRadius: 68, zIndex: 0,
          background: 'radial-gradient(ellipse, rgba(30,107,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Phone Shell */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.2 }}
        className="float-animation"
        style={{
          width: 320, height: 660,
          backgroundColor: '#080c14',
          borderRadius: 48,
          border: '10px solid #2a3348',
          boxShadow: '0 30px 70px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          zIndex: 2,
        }}
      >
        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 22, backgroundColor: '#000', borderRadius: 14,
          zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 9,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1a2133', border: '1px solid #374151' }} />
        </div>

        {/* Screen */}
        <div style={{ flex: 1, backgroundColor: '#070b14', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

          {/* Status Bar */}
          <div style={{ padding: '12px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#fff', fontWeight: 700, zIndex: 20 }}>
            <span>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={12} />
            </div>
          </div>

          {/* App Top Bar */}
          <div style={{ padding: '0.4rem 1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,15,29,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
            <ArrowLeft size={17} color="#cbd5e1" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <motion.div
                animate={{ boxShadow: ['0 0 6px #1e6bff', '0 0 14px #1e6bff', '0 0 6px #1e6bff'] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 17, height: 17, borderRadius: 5, backgroundColor: '#1e6bff', color: '#fff', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ▲
              </motion.div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>iNav</span>
            </div>
            <Settings size={17} color="#cbd5e1" />
          </div>

          {/* Mode Toggle */}
          <div style={{ padding: '0.6rem 0.9rem 0.3rem', zIndex: 20 }}>
            <motion.div
              onClick={() => setTunnelMode(!tunnelMode)}
              whileTap={{ scale: 0.97 }}
              layout
              style={{
                backgroundColor: tunnelMode ? 'rgba(16,185,129,0.15)' : 'rgba(30,107,255,0.15)',
                border: `1px solid ${tunnelMode ? '#10b981' : '#1e6bff'}`,
                borderRadius: 12, padding: '0.5rem 0.8rem',
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: tunnelMode ? '0 0 12px rgba(16,185,129,0.2)' : '0 0 12px rgba(30,107,255,0.2)',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8, fontSize: '0.95rem',
                backgroundColor: tunnelMode ? 'rgba(16,185,129,0.25)' : 'rgba(30,107,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {tunnelMode ? '🏚️' : '🛰️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  {tunnelMode ? 'Dead Reckoning Active' : 'GPS Mode Active'}
                </div>
                <div style={{ fontSize: '0.67rem', color: tunnelMode ? '#6ee7b7' : '#93c5fd' }}>
                  {tunnelMode ? `AI Drift: ${drift}` : `${satellites} Satellites Locked`}
                </div>
              </div>
              {/* Live indicator */}
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: tunnelMode ? '#10b981' : '#1e6bff' }}
              />
            </motion.div>
          </div>

          {/* 3D Road Canvas */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* Speedometer widget */}
            <motion.div
              animate={{ borderColor: ['#1e6bff', '#00d2ff', '#1e6bff'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute', top: 10, left: 10,
                width: 50, height: 50, borderRadius: '50%',
                backgroundColor: 'rgba(10,15,29,0.92)',
                border: '2.5px solid #1e6bff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={speed}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}
                >
                  {isTripActive ? speed : 0}
                </motion.div>
              </AnimatePresence>
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>km/h</div>
            </motion.div>

            {/* GPS DENIED badge */}
            <AnimatePresence>
              {tunnelMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
                    borderRadius: 6, padding: '0.2rem 0.45rem',
                    fontSize: '0.58rem', fontWeight: 700, color: '#fca5a5',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
                  GPS DENIED
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom telemetry card */}
          <div style={{
            backgroundColor: 'rgba(13,21,39,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '0.9rem 1rem 0.8rem', borderTopLeftRadius: 22, borderTopRightRadius: 22, zIndex: 20,
          }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', marginBottom: '0.75rem' }}>
              {[
                { label: 'Distance', value: '2.4', unit: 'km', color: '#fff' },
                { label: 'ETA', value: '5', unit: 'min', color: '#10b981' },
                { label: 'Speed', value: isTripActive ? speed : 0, unit: 'km/h', color: '#fff' },
              ].map((s, i) => (
                <div key={i}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={s.value}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color, lineHeight: 1 }}
                    >
                      {s.value} <span style={{ fontSize: '0.65rem' }}>{s.unit}</span>
                    </motion.div>
                  </AnimatePresence>
                  <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* End/Resume Trip */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsTripActive(!isTripActive)}
              style={{
                width: '100%', padding: '0.6rem',
                backgroundColor: isTripActive ? '#ef4444' : '#10b981',
                color: '#fff', border: 'none', borderRadius: 9,
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                marginBottom: '0.65rem',
                boxShadow: isTripActive ? '0 4px 14px rgba(239,68,68,0.4)' : '0 4px 14px rgba(16,185,129,0.4)',
                transition: 'background 0.3s ease',
              }}
            >
              {isTripActive ? 'End Trip' : 'Resume Trip'}
            </motion.button>

            {/* Bottom nav icons */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: '#94a3b8' }}>
              {[
                { icon: <Crosshair size={14} />, label: 'Re-center', active: true },
                { icon: <Map size={14} />, label: 'Map' },
                { icon: <Layers size={14} />, label: 'Layers' },
              ].map((item, i) => (
                <motion.div key={i} whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                  <span style={{ color: item.active ? '#1e6bff' : '#94a3b8' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.6rem', color: item.active ? '#1e6bff' : '#94a3b8', fontWeight: 600 }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      <style>{`
        @media (max-width: 1100px) { .screen-tunnel-quote { display: none !important; } }
      `}</style>
    </div>
  );
}
