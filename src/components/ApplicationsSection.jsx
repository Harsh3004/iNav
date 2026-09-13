import React, { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

const applications = [
  {
    id: 'drone',
    emoji: '🚁',
    title: 'Autonomous Drones',
    subtitle: 'Urban Air Mobility',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.5)',
    grad: 'linear-gradient(135deg,#1e1b4b,#312e81)',
    tag: 'UAV / VTOL',
    challenge: 'GPS-denied indoor & urban canyon flight — buildings create dead zones where conventional drone navigation completely fails.',
    solution: 'iNav provides centimeter-accurate indoor dead reckoning using barometric pressure + IMU fusion, keeping drones stable throughout the flight.',
    stats: [{ l: 'Position Accuracy', v: '< 8 cm', good: true }, { l: 'GPS Denied Range', v: '∞ Indoor', good: true }, { l: 'Altitude Error', v: '< 2 cm', good: true }],
  },
  {
    id: 'vehicle',
    emoji: '🚗',
    title: 'Smart Vehicles',
    subtitle: 'Level 3–5 Autonomy',
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.5)',
    grad: 'linear-gradient(135deg,#0c1a2e,#0f3460)',
    tag: 'AV / ADAS',
    challenge: 'Tunnel & underground parking lot navigation causes autonomous vehicles to freeze or dangerously deviate, compromising passenger safety.',
    solution: 'Real-time lane-level positioning with Non-Holonomic map-matching enables safe autonomous lane changes inside GNSS blackout zones at 8ms EKF rate.',
    stats: [{ l: 'Lane Error', v: '< 35 cm', good: true }, { l: 'Tunnel Duration', v: '> 10 km', good: true }, { l: 'EKF Latency', v: '8 ms', good: true }],
  },
  {
    id: 'sub',
    emoji: '🌊',
    title: 'Submarines & AUVs',
    subtitle: 'Underwater Navigation',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.5)',
    grad: 'linear-gradient(135deg,#042f2e,#065f46)',
    tag: 'AUV / UUV',
    challenge: 'Zero GPS underwater — seawater completely absorbs satellite signals, making 100% inertial dead reckoning the only viable option.',
    solution: 'Tightly coupled DVL + IMU fusion with AI terrain correlation achieves km-range underwater navigation with industry-best < 0.1% drift rate.',
    stats: [{ l: 'GPS Availability', v: '0% (ocean)', good: false }, { l: 'AI Drift Control', v: '< 0.1%', good: true }, { l: 'Depth Coverage', v: '6000 m+', good: true }],
  },
  {
    id: 'military',
    emoji: '🛡️',
    title: 'Military & Defense',
    subtitle: 'Anti-Jam Navigation',
    color: '#84cc16',
    glow: 'rgba(132,204,22,0.5)',
    grad: 'linear-gradient(135deg,#1a1a0e,#1f2e0a)',
    tag: 'SOLDIER / TANK',
    challenge: 'GPS jamming & denied battlefield environments — adversaries actively suppress satellite signals, rendering standard navigation useless.',
    solution: 'Anti-jamming INS with terrain-aided positioning for ground soldiers and armored vehicles provides fully offline, unjammable operation.',
    stats: [{ l: 'Anti-Jam Rating', v: 'Level 5', good: true }, { l: 'Bldg Navigation', v: 'Floor-level', good: true }, { l: 'Works Offline', v: '100%', good: true }],
  },
  {
    id: 'mining',
    emoji: '⛏️',
    title: 'Mining Robots',
    subtitle: 'Underground Ops',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.5)',
    grad: 'linear-gradient(135deg,#1c0a00,#2d1a00)',
    tag: 'UNDERGROUND ROBOT',
    challenge: 'Deep mine shafts 4 km+ below ground present zero satellite visibility and complex 3D tunnel networks requiring precise navigation.',
    solution: 'Wheel odometry + IMU + LiDAR SLAM fusion maintains < 50 cm shaft accuracy for mining robots kilometers underground with 99.97% uptime.',
    stats: [{ l: 'Mine Depth', v: '4 km+', good: true }, { l: 'Shaft Accuracy', v: '< 50 cm', good: true }, { l: 'System Uptime', v: '99.97%', good: true }],
  },
  {
    id: 'city',
    emoji: '🏙️',
    title: 'Smart City Fleet',
    subtitle: 'Urban Logistics',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.5)',
    grad: 'linear-gradient(135deg,#1e1040,#2d1b69)',
    tag: 'CITY MANAGEMENT',
    challenge: 'Urban canyon multipath & skyscraper GPS reflections cause 50-200 m position errors in city centers, disrupting fleet dispatch.',
    solution: 'AI map-matching eliminates skyscraper-bounce GPS errors for precise city fleet dispatch tracking across 50,000+ simultaneous vehicles.',
    stats: [{ l: 'Fleet Scale', v: '50,000+', good: true }, { l: 'Urban Accuracy', v: '98.5%', good: true }, { l: 'Response Time', v: '< 2 s', good: true }],
  },
  {
    id: 'rover',
    emoji: '🚀',
    title: 'Space Rovers',
    subtitle: 'Planetary Navigation',
    color: '#e879f9',
    glow: 'rgba(232,121,249,0.5)',
    grad: 'linear-gradient(135deg,#1a0030,#2d0a4e)',
    tag: 'ROVER / ISRO MISSION',
    challenge: 'No GPS on Moon or Mars — pure INS dead reckoning must maintain mission-critical accuracy across alien terrain without any infrastructure.',
    solution: 'Visual-inertial odometry + terrain feature matching keeps Chandrayaan-type rovers on precise mission paths with < 0.5%/km drift.',
    stats: [{ l: 'GPS Satellites', v: 'Zero (Moon)', good: false }, { l: 'Visual DR Error', v: '< 0.5%/km', good: true }, { l: 'Terrain Match', v: '99.2%', good: true }],
  },
  {
    id: 'delivery',
    emoji: '📦',
    title: 'Last-Mile Delivery',
    subtitle: 'Package Drones',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.5)',
    grad: 'linear-gradient(135deg,#1c0900,#431407)',
    tag: 'DRONE DELIVERY',
    challenge: 'Precise residential drops inside apartment complexes, covered markets, and dense urban areas require sub-meter accuracy impossible with GPS.',
    solution: 'iNav achieves < 1.2 m drop accuracy even inside covered areas, reducing battery usage by 23% through optimized flight paths.',
    stats: [{ l: 'Drop Accuracy', v: '< 1.2 m', good: true }, { l: 'Indoor Capable', v: 'Yes', good: true }, { l: 'Battery Saved', v: '23%', good: true }],
  },
];

// ─── Card Component ────────────────────────────────────────────
function AppCard({ app, isActive, onClick, index }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        borderRadius: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
        background: isActive ? app.grad : 'linear-gradient(135deg,#0f172a,#1a2540)',
        border: `1.5px solid ${isActive ? app.color : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isActive
          ? `0 0 0 1px ${app.color}40, 0 0 30px ${app.glow}, 0 20px 40px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        padding: '1.4rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Active radial glow overlay */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% -10%, ${app.glow} 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Tag pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', padding: '0.18rem 0.6rem',
        borderRadius: 999, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em',
        textTransform: 'uppercase', width: 'fit-content',
        background: `${app.color}22`, border: `1px solid ${app.color}55`, color: app.color,
      }}>
        {app.tag}
      </div>

      {/* Emoji icon */}
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 60, height: 60, borderRadius: 15, fontSize: '1.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${app.color}18`, border: `1px solid ${app.color}35`,
          boxShadow: isActive ? `0 0 20px ${app.glow}` : 'none',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {app.emoji}
      </motion.div>

      {/* Text */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.12rem', lineHeight: 1.3 }}>
          {app.title}
        </h3>
        <p style={{ fontSize: '0.7rem', color: app.color, fontWeight: 600, letterSpacing: '0.03em' }}>
          {app.subtitle}
        </p>
      </div>

      {/* Status dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 600, color: isActive ? app.color : '#334155' }}>
        <motion.div
          animate={isActive ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? app.color : '#334155' }}
        />
        {isActive ? 'Active' : 'Explore'}
      </div>
    </motion.div>
  );
}

// ─── Stat Row Item ─────────────────────────────────────────────
function StatRow({ label, value, good, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.8rem 1rem',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
      }}
    >
      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: good ? color : '#ef4444', fontFamily: 'monospace' }}>
        {value}
      </span>
    </motion.div>
  );
}

// ─── Main Section ──────────────────────────────────────────────
export default function ApplicationsSection() {
  const [active, setActive] = useState(1);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const app = applications[active];

  return (
    <section
      id="applications"
      ref={sectionRef}
      style={{ backgroundColor: '#060c1a', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background ambient orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '5%', left: '-5%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '5%', right: '-5%', width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 4rem auto' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ marginBottom: '1rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1.1rem', borderRadius: 999, fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8',
            }}>
              ✦ BEYOND ROADS — ALL DOMAINS
            </span>
          </motion.div>

          <h2 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 800, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: '1rem',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            iNav Powers{' '}
            <motion.span
              key={app.id + '-title'}
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${app.color} 0%, #e879f9 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Every Platform
            </motion.span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7 }}>
            From underground mines to the Moon's surface — our AI dead reckoning engine keeps every autonomous system precisely on course,{' '}
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>zero GPS dependency.</span>
          </p>
        </motion.div>

        {/* ── 8-Card Grid ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}
          className="apps-cards-grid"
        >
          {applications.map((a, i) => (
            <AppCard
              key={a.id}
              app={a}
              index={i}
              isActive={active === i}
              onClick={() => setActive(i)}
            />
          ))}
        </motion.div>

        {/* ── Navigation Dots ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem', marginBottom: '2rem' }}>
          {applications.map((a, i) => (
            <motion.div
              key={a.id}
              onClick={() => setActive(i)}
              animate={{ width: active === i ? 28 : 8, background: active === i ? a.color : 'rgba(255,255,255,0.15)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ height: 8, borderRadius: 4, cursor: 'pointer', boxShadow: active === i ? `0 0 8px ${a.color}` : 'none' }}
            />
          ))}
        </div>

        {/* ── Detail Panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: app.grad, borderRadius: 24,
              border: `1px solid ${app.color}35`,
              boxShadow: `0 0 80px ${app.glow}, 0 30px 60px rgba(0,0,0,0.5)`,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }} className="app-detail-grid">

              {/* Left: Info */}
              <div style={{ padding: '2.5rem 2.8rem', borderRight: `1px solid ${app.color}20`, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* App identity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{
                    width: 60, height: 60, borderRadius: 16, fontSize: '2rem',
                    background: `${app.color}22`, border: `1px solid ${app.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${app.glow}`,
                  }}>
                    {app.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.15rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {app.title}
                    </h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.09em', color: app.color, textTransform: 'uppercase' }}>
                      {app.tag}
                    </span>
                  </div>
                </motion.div>

                {/* Challenge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem 1.2rem' }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.4rem' }}>
                    ⚠ Navigation Challenge
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#fecaca', lineHeight: 1.7 }}>{app.challenge}</p>
                </motion.div>

                {/* Solution */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  style={{ background: `${app.color}12`, border: `1px solid ${app.color}30`, borderRadius: 12, padding: '1rem 1.2rem' }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.4rem', color: app.color }}>
                    ✓ iNav Solution
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.7 }}>{app.solution}</p>
                </motion.div>

                {/* CTA */}
                <motion.a
                  href="#simulator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.03, boxShadow: `0 12px 32px ${app.glow}` }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.6rem', padding: '0.9rem 1.6rem', borderRadius: 12,
                    background: app.color, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    textDecoration: 'none', boxShadow: `0 8px 24px ${app.glow}`,
                    cursor: 'pointer', border: 'none',
                  }}
                >
                  🎮 Try Live Simulator →
                </motion.a>
              </div>

              {/* Right: Stats */}
              <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.25rem' }}
                >
                  Performance Metrics
                </motion.div>

                {app.stats.map((s, i) => (
                  <StatRow key={s.l} label={s.l} value={s.v} good={s.good} color={app.color} index={i} />
                ))}

                {/* Animated Signal Rings decoration */}
                <motion.div
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80, marginTop: '0.5rem', position: 'relative' }}
                >
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, delay: ring * 0.55, repeat: Infinity, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${app.color}`,
                      }}
                    />
                  ))}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: app.color, boxShadow: `0 0 12px ${app.color}` }} />
                  <span style={{ marginLeft: '1rem', fontSize: '0.8rem', fontWeight: 600, color: app.color }}>
                    iNav Active
                  </span>
                </motion.div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .apps-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .app-detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .apps-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
