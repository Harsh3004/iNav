import React, { useState, useEffect, useRef } from 'react';
import { Target, Cpu, Map, RefreshCw, CheckCircle2, ChevronRight, Activity, Zap, Brain, Shield } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const isFloat = String(target).includes('.');
    const numericTarget = parseFloat(target);
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(numericTarget);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{typeof target === 'string' && target.includes('.') ? count.toFixed(1) : count}{suffix}</span>;
}

export default function FeaturesSection() {
  const [selectedCard, setSelectedCard] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Target size={26} />,
      bg: '#ecfdf5',
      border: '#a7f3d0',
      tagColor: '#10b981',
      title: 'Accurate in Challenging Environments',
      desc: 'Works reliably in tunnels, parking lots, urban canyons and dense forests.',
      metric: 'Restricts drift to < 3.8% (ISRO Target: < 10%)',
      techDetail: 'Eliminates reliance on satellite lines of sight. When entering concrete structures, the system seamlessly leverages 6-DOF MEMS IMU sensors fused via Extended Kalman Filter for lane-level accuracy.',
      stats: [{ v: 3.8, s: '%', l: 'Max Drift' }, { v: 10, s: 'Hz', l: 'Update Rate' }]
    },
    {
      icon: <Brain size={26} />,
      bg: '#eff6ff',
      border: '#bfdbfe',
      tagColor: '#1e6bff',
      title: 'AI-Powered Speed Estimation',
      desc: 'Filters noise and predicts vehicle motion using smartphone sensors.',
      metric: 'Zero OBD-II port connection required',
      techDetail: 'Trained on IO-VNBD vehicle kinematics, our deep neural filter isolates vehicle speed from engine idling vibrations and sudden pothole shocks with < 1% speed error.',
      stats: [{ v: 1, s: '%', l: 'Speed Error' }, { v: 0, s: ' OBD', l: 'No Hardware' }]
    },
    {
      icon: <Map size={26} />,
      bg: '#f5f3ff',
      border: '#ddd6fe',
      tagColor: '#8b5cf6',
      title: 'Map Matching & Lane Level Tracking',
      desc: 'Snaps your route to real roads using advanced AI and kinematic constraints.',
      metric: 'Non-Holonomic Constraints (NHC) enforced',
      techDetail: 'Enforces physics constraints (vehicles cannot fly or slide sideways) and binds trajectory vectors to offline OpenStreetMap geometric vectors for lane-precise navigation.',
      stats: [{ v: 35, s: 'cm', l: 'Lane Error' }, { v: 100, s: '%', l: 'Offline' }]
    },
    {
      icon: <Zap size={26} />,
      bg: '#fffbeb',
      border: '#fde68a',
      tagColor: '#f59e0b',
      title: 'Seamless GNSS + INS Fusion',
      desc: 'Instant transition between GNSS and dead reckoning modes.',
      metric: '10Hz Smartphone • 200Hz Edge Engine',
      techDetail: 'Extended Kalman Filter seamlessly combines GNSS pseudo-ranges with IMU integration, switching back instantaneously upon tunnel exit with < 8ms handover latency.',
      stats: [{ v: 8, s: 'ms', l: 'Handover' }, { v: 200, s: 'Hz', l: 'Edge Rate' }]
    }
  ];

  const selected = features[selectedCard];

  return (
    <section id="features" ref={sectionRef} style={{
      backgroundColor: '#f8fafc', padding: '5.5rem 0', borderBottom: '1px solid #e2e8f0'
    }}>
      <div className="container">

        {/* Header */}
        <div style={{
          textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.6s ease'
        }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <span className="badge-pill badge-pill-light">
              <Activity size={14} /> WHY CHOOSE INAV?
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.4vw, 2.75rem)', fontWeight: 800, color: '#0f172a',
            marginBottom: '1rem', letterSpacing: '-0.02em'
          }}>
            More Than <span style={{ color: '#1e6bff' }}>Just Navigation</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6 }}>
            A smarter, safer and more reliable way to move — for every road, every journey.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem', marginBottom: '2.5rem',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.6s ease 0.15s'
        }} className="features-card-grid">
          {features.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedCard(idx)}
              className={`clean-card ${selectedCard === idx ? 'active-tab' : ''}`}
              style={{
                display: 'flex', flexDirection: 'column', padding: '1.75rem 1.5rem',
                backgroundColor: '#ffffff', cursor: 'pointer',
                border: selectedCard === idx ? `2px solid ${item.tagColor}` : '1px solid #e2e8f0',
                transform: selectedCard === idx ? 'translateY(-6px)' : 'none',
                boxShadow: selectedCard === idx ? `0 12px 30px ${item.tagColor}20` : undefined
              }}
            >
              {/* Icon */}
              <div style={{
                width: '54px', height: '54px', borderRadius: '14px',
                backgroundColor: item.bg, border: `1px solid ${item.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem', color: item.tagColor, transition: 'transform 0.3s ease'
              }}>
                {item.icon}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem', lineHeight: 1.35 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                {item.desc}
              </p>

              {/* Mini stat badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {item.stats.map((s, si) => (
                  <div key={si} style={{
                    flex: 1, background: item.bg, border: `1px solid ${item.border}`,
                    borderRadius: '8px', padding: '0.45rem 0.5rem', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.tagColor, lineHeight: 1.1 }}>
                      {visible ? <AnimatedCounter target={s.v} suffix={s.s} /> : `${s.v}${s.s}`}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', color: item.tagColor, fontWeight: 600
              }}>
                <span>{selectedCard === idx ? '● Active Spec' : 'View Spec'}</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Detail Expansion Panel */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: `1px solid ${selected.border}`, padding: '1.75rem 2rem',
          boxShadow: `0 10px 25px ${selected.tagColor}10`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.5rem', transition: 'all 0.4s ease',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color: selected.tagColor,
                backgroundColor: selected.bg, padding: '0.2rem 0.6rem', borderRadius: '6px'
              }}>
                ISRO SPECIFICATION COMPLIANT
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{selected.metric}</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '750px', lineHeight: 1.65 }}>
              {selected.techDetail}
            </div>
          </div>
          <a href="#download" className="btn-blue" style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', flexShrink: 0 }}>
            Test On Your Phone
          </a>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginTop: '2.5rem',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.25s'
        }} className="features-stats-row">
          {[
            { icon: '🎯', metric: '<10%', label: 'Drift Compliance Threshold (ISRO)', color: '#10b981' },
            { icon: '⚡', metric: '8ms', label: 'GNSS→INS Switchover Latency', color: '#1e6bff' },
            { icon: '📱', metric: '10Hz', label: 'Native Smartphone IMU Fusion', color: '#8b5cf6' },
            { icon: '🛣️', metric: '35cm', label: 'Lane-Level Positioning Error', color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
              padding: '1.25rem', textAlign: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.metric}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .features-card-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .features-card-grid { grid-template-columns: 1fr !important; }
          .features-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
