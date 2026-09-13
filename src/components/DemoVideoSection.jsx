import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw,
  ChevronRight, CheckCircle, Zap, Radio, Satellite, Map
} from 'lucide-react';

// ─── Video Chapter Data ───────────────────────────────────────
const chapters = [
  { id: 0, time: 0,   end: 22,  label: 'GNSS Lock',       desc: 'Vehicle starts with full GPS lock — 14 satellites, 0.8m accuracy.', color: '#10b981', icon: <Satellite size={14}/> },
  { id: 1, time: 22,  end: 55,  label: 'Tunnel Entry',    desc: 'Vehicle enters underground tunnel. GPS signal drops to zero.', color: '#f59e0b', icon: <Radio size={14}/> },
  { id: 2, time: 55,  end: 100, label: 'Dead Reckoning',  desc: 'iNav takes over — IMU + map-matching maintains lane accuracy.', color: '#1e6bff', icon: <Zap size={14}/> },
  { id: 3, time: 100, end: 130, label: 'GNSS Re-acquire', desc: 'Vehicle exits tunnel. GPS re-locks instantly with zero position jump.', color: '#8b5cf6', icon: <Map size={14}/> },
  { id: 4, time: 130, end: 150, label: 'Route Complete',  desc: 'Full trip complete — drift below 3.2%, ISRO target achieved.', color: '#e879f9', icon: <CheckCircle size={14}/> },
];

const TOTAL_DURATION = 150; // seconds

// ─── Canvas-driven "Video" Renderer ──────────────────────────
function useVideoCanvas(canvasRef, time, isPlaying) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let localTime = 0;
    let lastTs = null;

    const phase = time / TOTAL_DURATION; // 0→1 overall
    let renderOffset = 0;

    const draw = (ts) => {
      if (isPlaying) {
        if (lastTs !== null) renderOffset += (ts - lastTs) / 1000 * 0.05;
        lastTs = ts;
      } else {
        lastTs = null;
      }
      renderOffset = renderOffset % 1;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      const W = rect.width, H = rect.height;

      const chapterIdx = chapters.findIndex(c => time >= c.time && time < c.end);
      const currentChapter = chapterIdx >= 0 ? chapterIdx : 4;

      // ── Background ──
      if (currentChapter === 0) {
        // Sunny city scene
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
        skyGrad.addColorStop(0, '#0f2044');
        skyGrad.addColorStop(1, '#1e3a6e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
      } else if (currentChapter >= 1 && currentChapter <= 2) {
        // Dark tunnel
        ctx.fillStyle = '#050a16';
        ctx.fillRect(0, 0, W, H);
      } else {
        // Exit / daylight
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        skyGrad.addColorStop(0, '#0a1628');
        skyGrad.addColorStop(1, '#1e3a5f');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
      }

      const vpX = W * 0.5, vpY = H * 0.35;

      if (currentChapter >= 1 && currentChapter <= 2) {
        // ── Tunnel arch rings ──
        for (let i = 7; i >= 1; i--) {
          const p = (i - 1 + renderOffset) / 7;
          const rw = 60 + p * p * W * 0.88;
          const rh = 40 + p * p * H * 0.78;
          ctx.strokeStyle = `rgba(245,158,11,${0.1 + p * 0.55})`;
          ctx.lineWidth = 1.5 + p * 2;
          ctx.beginPath();
          ctx.ellipse(vpX, vpY + p * 18, rw / 2, rh / 2, 0, Math.PI, 0, false);
          ctx.stroke();
          // Sodium lamps
          ctx.fillStyle = '#ffb703';
          ctx.shadowColor = '#ffb703'; ctx.shadowBlur = 8 * p;
          ctx.beginPath(); ctx.arc(vpX - rw * 0.4, vpY + p * 18 - rh * 0.44, 2.2 * p + 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(vpX + rw * 0.4, vpY + p * 18 - rh * 0.44, 2.2 * p + 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        // ── City skyline ──
        const bldgColors = ['#1e293b', '#263348', '#1a2540'];
        for (let b = 0; b < 12; b++) {
          const bx = (b / 12) * W - 20;
          const bh = 50 + ((b * 37 + 13) % 80);
          const bw = 30 + (b % 3) * 10;
          ctx.fillStyle = bldgColors[b % 3];
          ctx.fillRect(bx, H * 0.42 - bh, bw, bh);
          // Window glows
          for (let wr = 0; wr < 3; wr++) {
            for (let wc = 0; wc < 2; wc++) {
              const lit = Math.random() > 0.4;
              if (lit) {
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(bx + 6 + wc * 12, H * 0.42 - bh + 10 + wr * 16, 6, 6);
              }
            }
          }
        }
      }

      // ── Road ──
      ctx.fillStyle = currentChapter >= 1 && currentChapter <= 2 ? '#0c1322' : '#090e1c';
      ctx.beginPath();
      ctx.moveTo(vpX - 28, vpY);
      ctx.lineTo(vpX + 28, vpY);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Road borders
      ctx.strokeStyle = 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vpX - 28, vpY); ctx.lineTo(0, H);
      ctx.moveTo(vpX + 28, vpY); ctx.lineTo(W, H);
      ctx.stroke();

      // Center lane dashes
      for (let d = 0; d < 6; d++) {
        const dp = (d + renderOffset) / 6;
        const y1 = vpY + dp * dp * (H - vpY);
        const y2 = vpY + (dp + 0.08) * (dp + 0.08) * (H - vpY);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(vpX, y1); ctx.lineTo(vpX, y2); ctx.stroke();
      }

      // ── iNav route line ──
      const routeColor = chapters[currentChapter]?.color || '#1e6bff';
      ctx.strokeStyle = routeColor;
      ctx.lineWidth = 8;
      ctx.shadowColor = routeColor;
      ctx.shadowBlur = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(vpX, vpY + 10);
      ctx.quadraticCurveTo(vpX + Math.sin(ts * 0.001) * 8, (vpY + H) * 0.6, vpX, H - 40);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // ── Vehicle ──
      const vehicleY = H * 0.72;
      ctx.fillStyle = routeColor;
      ctx.shadowColor = routeColor;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(vpX - 16, vehicleY, 32, 16, 5);
      ctx.fill();
      // Headlights
      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 8;
      ctx.fillRect(vpX - 14, vehicleY, 6, 3);
      ctx.fillRect(vpX + 8, vehicleY, 6, 3);
      ctx.shadowBlur = 0;

      // ── GPS Status overlay ──
      const isGpsLost = currentChapter >= 1 && currentChapter <= 2;
      ctx.fillStyle = isGpsLost ? 'rgba(239,68,68,0.85)' : 'rgba(16,185,129,0.85)';
      ctx.beginPath(); ctx.roundRect(12, 12, 110, 26, 6); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Inter, monospace';
      ctx.fillText(isGpsLost ? '⊗ GPS DENIED' : '✓ GPS LOCKED', 20, 30);

      // ── Drift meter (chapter 2) ──
      if (currentChapter === 2) {
        const driftPct = ((time - 55) / 45) * 2.8 + 0.5;
        ctx.fillStyle = 'rgba(10,15,29,0.92)';
        ctx.beginPath(); ctx.roundRect(W - 130, 12, 118, 42, 8); ctx.fill();
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(W - 130, 12, 118, 42, 8); ctx.stroke();
        ctx.fillStyle = '#10b981'; ctx.font = '700 10px monospace';
        ctx.fillText('AI DRIFT', W - 120, 28);
        ctx.fillStyle = '#ffffff'; ctx.font = '800 15px monospace';
        ctx.fillText(`${driftPct.toFixed(1)}m  (< 3.8%)`, W - 120, 46);
      }

      ctx.restore();
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [time, isPlaying]);
}

// ─── Chapter Pill ─────────────────────────────────────────────
function ChapterPill({ chapter, isActive, onClick, totalDuration }) {
  const widthPct = ((chapter.end - chapter.time) / totalDuration) * 100;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        padding: '0.4rem 0.85rem', borderRadius: 999, cursor: 'pointer', border: 'none',
        background: isActive ? `${chapter.color}22` : 'rgba(255,255,255,0.05)',
        color: isActive ? chapter.color : '#64748b',
        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
        boxShadow: isActive ? `0 0 12px ${chapter.color}44` : 'none',
        transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
        outline: `1.5px solid ${isActive ? chapter.color + '55' : 'transparent'}`,
      }}
    >
      <span style={{ color: isActive ? chapter.color : '#475569' }}>{chapter.icon}</span>
      {chapter.label}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  useVideoCanvas(canvasRef, time, isPlaying);

  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      setTime(t => {
        if (t >= TOTAL_DURATION) { setIsPlaying(false); return TOTAL_DURATION; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isPlaying]);

  const currentChapterIdx = chapters.findIndex(c => time >= c.time && time < c.end);
  const currentChapter = currentChapterIdx >= 0 ? currentChapterIdx : 4;

  const seekTo = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setTime(Math.round(pct * TOTAL_DURATION));
  }, []);

  const reset = () => { setTime(0); setIsPlaying(false); };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const highlights = [
    { icon: '🎯', v: '< 3.2%', l: 'Total Drift', sub: 'vs 48% raw IMU' },
    { icon: '⚡', v: '8ms', l: 'GNSS Switchover', sub: 'zero position jump' },
    { icon: '📡', v: '0 sats', l: 'In Tunnel', sub: 'fully AI-powered' },
    { icon: '✅', v: '100%', l: 'Navigation Up', sub: 'no freeze frames' },
  ];

  return (
    <section
      id="demo"
      ref={sectionRef}
      style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', padding: '5.5rem 0', borderBottom: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(30,107,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139,92,246,0.04) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div className="container">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 3.5rem auto' }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1rem', borderRadius: 999, fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
              background: 'rgba(30,107,255,0.08)', border: '1px solid rgba(30,107,255,0.2)', color: '#1e6bff'
            }}>
              <Play size={12} fill="#1e6bff" /> WATCH THE SYSTEM IN ACTION
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.6vw, 2.9rem)', fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            From GPS Lock to Tunnel Blackout —{' '}
            <span style={{ color: '#1e6bff' }}>iNav Never Misses a Beat</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.7 }}>
            Watch our full navigation demo showing real-time sensor fusion, dead reckoning activation, and seamless GNSS re-acquisition across a 2:30 live drive simulation.
          </p>
        </motion.div>

        {/* ── Main Layout: Video + Info ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="demo-main-grid">

          {/* ─── Video Player ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Chapter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {chapters.map((c, i) => (
                <ChapterPill
                  key={c.id} chapter={c} isActive={currentChapter === i}
                  onClick={() => { setTime(c.time); setIsPlaying(true); }}
                  totalDuration={TOTAL_DURATION}
                />
              ))}
            </div>

            {/* Player container */}
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 25px 60px -10px rgba(15,23,42,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
              background: '#000', position: 'relative'
            }}>

              {/* Top bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                padding: '0.85rem 1.1rem',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <motion.div
                    animate={{ boxShadow: ['0 0 6px #1e6bff', '0 0 14px #1e6bff', '0 0 6px #1e6bff'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 22, height: 22, borderRadius: 6, background: '#1e6bff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}
                  >▲</motion.div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>iNav — Live Drive Demo</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>2:30 min · Bangalore Metro Highway</div>
                  </div>
                </div>
                {/* Chapter badge */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentChapter}
                    initial={{ opacity: 0, scale: 0.8, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 6 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '0.25rem 0.65rem', borderRadius: 999,
                      background: `${chapters[currentChapter]?.color}33`,
                      border: `1px solid ${chapters[currentChapter]?.color}66`,
                      color: chapters[currentChapter]?.color,
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em'
                    }}
                  >
                    {chapters[currentChapter]?.label}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Canvas viewport */}
              <div style={{ position: 'relative', width: '100%', height: 380, background: '#050a16' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

                {/* Big play button overlay */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      onClick={() => setIsPlaying(true)}
                      style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.35)', cursor: 'pointer',
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: 76, height: 76, borderRadius: '50%',
                          background: 'rgba(30,107,255,0.92)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 40px rgba(30,107,255,0.6), 0 0 0 12px rgba(30,107,255,0.18)',
                          color: '#fff',
                        }}
                      >
                        <Play size={30} style={{ marginLeft: 4 }} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chapter progress overlay (bottom-left) */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(10,15,29,0.85)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '0.35rem 0.7rem',
                  fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 600
                }}>
                  Chapter {currentChapter + 1} / {chapters.length}
                </div>
              </div>

              {/* Controls bar */}
              <div style={{ padding: '0.7rem 1.1rem 0.9rem', background: '#0a0f1d', borderTop: '1px solid #1e293b' }}>

                {/* Progress bar with chapter markers */}
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  {/* Chapter markers */}
                  <div style={{ position: 'absolute', top: -8, left: 0, right: 0, height: 8, pointerEvents: 'none', zIndex: 2 }}>
                    {chapters.slice(1).map((c) => (
                      <div key={c.id} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${(c.time / TOTAL_DURATION) * 100}%`,
                        width: 2, background: c.color, borderRadius: 2,
                        boxShadow: `0 0 4px ${c.color}`,
                      }} />
                    ))}
                  </div>

                  {/* Scrubber track */}
                  <div
                    onClick={seekTo}
                    style={{ height: 5, background: '#1e293b', borderRadius: 999, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  >
                    {/* Buffered (grey) */}
                    <div style={{ position: 'absolute', inset: 0, background: '#334155', borderRadius: 999, width: '80%' }} />
                    {/* Played (blue) */}
                    <motion.div
                      animate={{ width: `${(time / TOTAL_DURATION) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'linear' }}
                      style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        background: `linear-gradient(90deg, ${chapters[currentChapter]?.color || '#1e6bff'} 0%, #00d2ff 100%)`,
                        borderRadius: 999,
                      }}
                    />
                    {/* Scrubber thumb */}
                    <motion.div
                      animate={{ left: `${(time / TOTAL_DURATION) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'linear' }}
                      style={{
                        position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                        width: 13, height: 13, borderRadius: '50%',
                        background: '#fff', boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                      }}
                    />
                  </div>
                </div>

                {/* Controls row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={reset} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
                      <RotateCcw size={16} />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
                      {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </motion.button>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {fmt(time)} / {fmt(TOTAL_DURATION)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Speed badge */}
                    <div style={{ padding: '0.2rem 0.55rem', borderRadius: 6, background: '#1e293b', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                      1× Speed
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
                      <Maximize2 size={17} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Right Info Panel ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2.5rem' }}
          >
            {/* Live Chapter Callout */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                style={{
                  background: `${chapters[currentChapter]?.color}12`,
                  border: `1.5px solid ${chapters[currentChapter]?.color}40`,
                  borderRadius: 16, padding: '1.25rem 1.4rem',
                  boxShadow: `0 8px 28px ${chapters[currentChapter]?.color}18`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: chapters[currentChapter]?.color }}
                  />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: chapters[currentChapter]?.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    NOW PLAYING
                  </span>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {chapters[currentChapter]?.label}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65 }}>
                  {chapters[currentChapter]?.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Chapter List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.25rem' }}>
                Chapter Guide
              </div>
              {chapters.map((c, i) => {
                const isActive = currentChapter === i;
                const isDone = time >= c.end;
                return (
                  <motion.div
                    key={c.id}
                    onClick={() => { setTime(c.time); setIsPlaying(true); }}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      padding: '0.7rem 0.9rem', borderRadius: 12, cursor: 'pointer',
                      background: isActive ? `${c.color}10` : 'transparent',
                      border: `1px solid ${isActive ? c.color + '35' : 'transparent'}`,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: isDone ? c.color : isActive ? `${c.color}25` : '#f1f5f9',
                      border: `1px solid ${isDone || isActive ? c.color : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDone ? '#fff' : isActive ? c.color : '#94a3b8',
                      fontSize: '0.8rem', fontWeight: 700,
                    }}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#0f172a' : '#475569' }}>
                        {c.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {fmt(c.time)} – {fmt(c.end)}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.a
              href="#download"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-blue"
              style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.85rem' }}
            >
              <ChevronRight size={17} /> Try iNav On Your Phone
            </motion.a>
          </motion.div>
        </div>

        {/* ── Highlight Stats Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.65 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginTop: '2.5rem' }}
          className="demo-stats-strip"
        >
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(30,107,255,0.1)' }}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
                padding: '1.25rem', textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
            >
              <div style={{ fontSize: '1.65rem', marginBottom: '0.4rem' }}>{h.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e6bff', lineHeight: 1.1 }}>{h.v}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{h.l}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{h.sub}</div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 980px) {
          .demo-main-grid { grid-template-columns: 1fr !important; }
          .demo-stats-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .demo-stats-strip { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}
