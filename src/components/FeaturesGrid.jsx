import React from 'react';
import { Compass, Cpu, Map, RefreshCw, Zap, Shield, Smartphone, Server, CheckCircle } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Compass size={28} color="var(--cyan)" />,
      badge: "Module 01",
      title: "In-Vehicle Auto-Alignment & Calibration",
      description: "Automatically computes rotation matrix between phone coordinate frame and vehicle body axis (pitch, roll, yaw), regardless of whether the phone is mounted on the windshield, dashboard, or air vent holder.",
      metrics: "Sub-1° alignment within 3 sec of driving"
    },
    {
      icon: <Cpu size={28} color="var(--blue)" />,
      badge: "Module 02",
      title: "AI Speed & Vibration Filter (No OBD-II)",
      description: "On-device lightweight neural network trained on vehicle kinematics that filters out engine idling harmonics, pothole shocks, and chassis rattles to directly predict vehicle forward velocity from IMU signals alone.",
      metrics: "99.4% noise rejection • Zero OBD-II feed needed"
    },
    {
      icon: <Map size={28} color="var(--emerald)" />,
      badge: "Module 03",
      title: "Offline OSM Map-Matching & NHC Constraints",
      description: "Binds the inertial trajectory to offline OpenStreetMap road vectors. Applies Non-Holonomic Constraints (vehicles cannot slide sideways or fly), snapping drifting IMU paths back onto the driving lane.",
      metrics: "Hidden Markov Model (HMM) + 100% offline OSM"
    },
    {
      icon: <Zap size={28} color="var(--isro-orange)" />,
      badge: "Module 04",
      title: "GNSS+INS Sensor Fusion Engine",
      description: "Hybrid Extended Kalman Filter combining multi-constellation GNSS (GPS, NavIC, Galileo) with 6-DOF IMU data, providing continuous position vectors and eliminating drift error accumulation.",
      metrics: "10Hz Smartphone • 200Hz Edge Engine"
    },
    {
      icon: <RefreshCw size={28} color="var(--cyan)" />,
      badge: "Module 05",
      title: "Sub-Millisecond GNSS Deficit Handler",
      description: "Instantaneously detects carrier-to-noise (C/N0) degradation at tunnel portals or underground ramps, seamlessly swapping into dead reckoning mode in < 8ms with zero frozen UI frames.",
      metrics: "< 8ms transition latency • 0s blackout freeze"
    },
    {
      icon: <Server size={28} color="var(--blue)" />,
      badge: "Module 06",
      title: "Edge Deployable FOG & Tactical IMU Engine",
      description: "Modular C++ / Python SDK that runs not only on smartphones, but also on edge computing units (Jetson, Raspberry Pi) connected to external Fiber Optic Gyroscope (FOG) or MEMS tactical sensors.",
      metrics: "Cross-platform C++17 runtime • 200Hz FOG update"
    }
  ];

  return (
    <section id="features" style={{
      padding: '5rem 0',
      position: 'relative',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge-tech badge-isro" style={{ marginBottom: '0.8rem' }}>
            Core Technical Architecture
          </div>
          <h2 className="heading-font" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', color: '#fff', marginBottom: '1rem' }}>
            Engineered for <span className="text-gradient-cyan">Extreme Environments</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Built specifically to address the ISRO Smart Vehicles navigation challenge across millions of Indian two-wheelers, 
            commercial logistics fleets, and emergency responders navigating tunnels and urban canyons.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid-3">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel" style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(6, 9, 17, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                  }}>
                    {feat.icon}
                  </div>
                  <span className="badge-tech" style={{ fontSize: '0.72rem' }}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="heading-font" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {feat.description}
                </p>
              </div>

              {/* Metric Tag at bottom */}
              <div style={{
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(6, 9, 17, 0.6)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyan)'
              }}>
                <CheckCircle size={14} color="var(--emerald)" />
                <span>{feat.metrics}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
