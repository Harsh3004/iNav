import React, { useState, useEffect, useRef } from 'react';
import { Car, Truck, Bike, ShoppingBag, ShieldAlert, Plane, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function UseCasesSection() {
  const [activeTab, setActiveTab] = useState(0);
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

  const useCases = [
    {
      id: 0,
      title: 'Personal Vehicles',
      desc: 'Everyday navigation, worry-free',
      icon: <Car size={28} />,
      tag: 'Cars & SUVs',
      color: '#1e6bff',
      bgColor: 'rgba(30, 107, 255, 0.1)',
      borderColor: 'rgba(30, 107, 255, 0.35)',
      problem: 'Entering multi-level underground basement parking or highway underpasses causes Google Maps to freeze and miscalculate upcoming ramp exits.',
      solution: 'iNav automatically kicks into Dead Reckoning mode within 8ms of tunnel entry, tracking vehicle turns accurately down to lane level.',
      metric: '8ms switch-over • < 35cm lane error'
    },
    {
      id: 1,
      title: 'Logistics & Fleet',
      desc: 'Reliable tracking, always',
      icon: <Truck size={28} />,
      tag: 'Heavy Freight',
      color: '#0284c7',
      bgColor: 'rgba(2, 132, 199, 0.1)',
      borderColor: 'rgba(2, 132, 199, 0.35)',
      problem: 'Commercial trucks traversing long mountain tunnels (like Atal Tunnel / Zojila) experience complete GPS dead-zones, disabling fleet telemetry.',
      solution: 'Continuous inertial propagation maintains vehicle milestone reports and estimated transit time without cellular or GNSS connectivity.',
      metric: '99.9% uptime • Zojila-tested 8.5km tunnel'
    },
    {
      id: 2,
      title: 'Two-Wheelers',
      desc: 'Accurate navigation on the go',
      icon: <Bike size={28} />,
      tag: 'Motorcycles & Scooters',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.35)',
      problem: 'Smartphones clamped to motorcycle handlebars endure severe engine harmonics, rough road shocks, and irregular handlebar tilt angles.',
      solution: 'In-Vehicle Alignment Engine calculates 3D rotation relative to the driving axis within 30 meters, while our 1D-CNN filters out road potholes.',
      metric: '1D-CNN noise filter • 30m self-calibration'
    },
    {
      id: 3,
      title: 'Quick Commerce',
      desc: 'On-time deliveries, every time',
      icon: <ShoppingBag size={28} />,
      tag: 'Hyperlocal Couriers',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      problem: 'Delivery executives in dense urban canyons surrounded by high-rises suffer severe multipath GPS errors and incorrect drop locations.',
      solution: 'Offline OSM map matching binds the courier\'s trajectory to the actual street grid, eliminating erratic skyscraper-bounce GPS errors.',
      metric: 'OSM map matching • < 2m urban accuracy'
    },
    {
      id: 4,
      title: 'Emergency Responders',
      desc: 'Reach faster, save lives',
      icon: <ShieldAlert size={28} />,
      tag: 'Ambulance & Fire',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.35)',
      problem: 'Emergency ambulances transporting critical patients cannot afford missed highway bypass exits inside signal-blocked underpasses.',
      solution: 'Sub-millisecond deficit handler guarantees zero frozen navigation frames, keeping turn-by-turn audio prompts continuous throughout.',
      metric: '< 1ms frame deficit • Zero navigation freeze'
    },
    {
      id: 5,
      title: 'Drone Logistics',
      desc: 'Precise autonomous delivery',
      icon: <Plane size={28} />,
      tag: 'UAV Delivery',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.35)',
      problem: 'Delivery drones entering covered warehouses, indoor markets, or dense urban canyons lose GPS signal and risk dangerous crashes.',
      solution: 'Barometric-IMU fusion dead reckoning keeps delivery drones stable and on-course inside GPS-denied indoor spaces.',
      metric: '< 8cm hover accuracy • Indoor capable'
    },
  ];

  const current = useCases[activeTab];

  return (
    <section id="use-cases" ref={sectionRef} style={{
      backgroundColor: '#ffffff',
      padding: '5.5rem 0',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div className="container">

        {/* Header */}
        <div style={{
          textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.6s ease'
        }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <span className="badge-pill badge-pill-light">BUILT FOR REAL-WORLD IMPACT</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.4vw, 2.75rem)', fontWeight: 800, color: '#0f172a',
            marginBottom: '0.85rem', letterSpacing: '-0.02em'
          }}>
            Designed for <span style={{ color: '#1e6bff' }}>Everyone on the Move</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b' }}>
            Powering seamless transit across all road users throughout Indian highways, tunnels, and urban centers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex', gap: '0.65rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '2.5rem',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.1s'
        }}>
          {useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setActiveTab(uc.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 1.1rem', borderRadius: '999px',
                border: `1.5px solid ${activeTab === uc.id ? uc.color : '#e2e8f0'}`,
                background: activeTab === uc.id ? uc.bgColor : '#ffffff',
                color: activeTab === uc.id ? uc.color : '#64748b',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === uc.id ? `0 4px 12px ${uc.color}28` : 'none'
              }}
            >
              <span style={{ color: activeTab === uc.id ? uc.color : '#94a3b8' }}>{uc.icon}</span>
              {uc.title}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{
          backgroundColor: '#f8fafc', borderRadius: '20px',
          border: `2px solid ${current.color}30`,
          padding: '2.5rem',
          display: 'grid', gridTemplateColumns: '1fr 1.1fr',
          gap: '2.5rem', alignItems: 'center',
          boxShadow: `0 8px 30px ${current.color}15`,
          transition: 'all 0.4s ease',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
        }} className="spotlight-grid">

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: current.bgColor, border: `1px solid ${current.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: current.color
              }}>
                {current.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.15rem' }}>
                  {current.tag}
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {current.title} Challenge
                </h3>
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                ⚠ The Problem
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.65 }}>{current.problem}</p>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', borderRadius: '8px',
              background: current.bgColor, border: `1px solid ${current.borderColor}`,
              fontSize: '0.78rem', fontWeight: 700, color: current.color
            }}>
              📊 {current.metric}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff', padding: '1.75rem',
            borderRadius: '16px', border: `1px solid ${current.color}25`,
            boxShadow: `0 8px 24px ${current.color}12`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} />
              <span>iNav Solution:</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {current.solution}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: current.color, fontWeight: 600 }}>
              <span>Benchmarked with IO-VNBD Ground Odometry</span>
              <ArrowRight size={14} />
            </div>
          </div>

        </div>

        {/* Bottom row of mini stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem',
          marginTop: '2rem',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.2s'
        }} className="use-case-stats-grid">
          {[
            { icon: '🎯', label: 'Drift Compliance', val: '< 3.8%', sub: 'ISRO target < 10%' },
            { icon: '⚡', label: 'GNSS Switchover', val: '8ms', sub: 'Zero navigation freeze' },
            { icon: '📡', label: 'IMU Fusion Rate', val: '10 Hz', sub: 'Smartphone-native' }
          ].map((s, i) => (
            <div key={i} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e6bff', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .spotlight-grid { grid-template-columns: 1fr !important; }
          .use-case-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
