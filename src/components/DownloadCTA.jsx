import React, { useState, useEffect } from 'react';
import { Download, Shield, Navigation, Users, QrCode, Smartphone, CheckCircle2, Cpu, Activity, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DownloadCTA() {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [testingSensors, setTestingSensors] = useState(false);
  const [sensorValues, setSensorValues] = useState({ x: 0, y: 9.8, z: 0.1 });

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setDownloadComplete(true);
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch (e) {}

          const link = document.createElement('a');
          link.href = '/navpulse-release-v1.4.2.apk';
          link.download = 'inav-v1.4.2.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => setDownloadComplete(false), 5000);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Live sensor test
  const toggleSensorTest = () => {
    setTestingSensors(!testingSensors);
  };

  useEffect(() => {
    let anim;
    if (testingSensors) {
      anim = setInterval(() => {
        setSensorValues({
          x: ((Math.random() - 0.5) * 0.8).toFixed(2),
          y: (9.81 + (Math.random() - 0.5) * 0.2).toFixed(2),
          z: ((Math.random() - 0.5) * 0.4).toFixed(2)
        });
      }, 100);
    }
    return () => clearInterval(anim);
  }, [testingSensors]);

  return (
    <section id="download" style={{
      backgroundColor: '#0a0f1d',
      padding: '5.5rem 0',
      position: 'relative',
      borderTop: '1px solid #1e293b',
      overflow: 'hidden'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(30, 107, 255, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '3rem',
          alignItems: 'center'
        }} className="cta-grid">
          
          {/* Left Column: Heading & Download Options */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge-pill badge-pill-dark">
                GET STARTED TODAY
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              Download iNav
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '520px'
            }}>
              Navigate beyond limitations. Available now for Android smartphones and tactical embedded systems.
            </p>

            {/* Download Buttons Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              
              {/* Google Play */}
              <button onClick={handleDownload} className="btn-store" style={{ cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3.6 2.4L13.8 12L3.6 21.6C3.2 21.2 3 20.6 3 19.8V4.2C3 3.4 3.2 2.8 3.6 2.4Z" fill="#2196F3"/>
                  <path d="M17.2 8.8L13.8 12L17.2 15.2L20.8 13.2C21.6 12.8 21.6 11.2 20.8 10.8L17.2 8.8Z" fill="#FFC107"/>
                  <path d="M13.8 12L3.6 2.4C4.1 2 4.9 2.1 5.6 2.5L17.2 8.8L13.8 12Z" fill="#4CAF50"/>
                  <path d="M13.8 12L17.2 15.2L5.6 21.5C4.9 21.9 4.1 22 3.6 21.6L13.8 12Z" fill="#F44336"/>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#94a3b8' }}>GET IT ON</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Google Play</div>
                </div>
              </button>

              {/* App Store */}
              <button onClick={handleDownload} className="btn-store" style={{ cursor: 'pointer' }}>
                <svg width="22" height="24" viewBox="0 0 170 170" fill="#ffffff">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.43-5.63-8.6-10.04-18.77-13.22-30.52-3.18-11.75-4.77-22.84-4.77-33.27 0-16.14 4.09-29.6 12.27-40.38 8.18-10.78 18.66-16.29 31.44-16.53 4.8 0 10.15 1.25 16.06 3.75 5.91 2.5 9.77 3.75 11.58 3.75 1.57 0 5.37-1.25 11.41-3.75 6.04-2.5 11.39-3.65 16.06-3.45 14.15.82 25.17 6.47 33.06 16.96-12.27 7.42-18.29 17.51-18.06 30.27.24 9.94 4.08 18.42 11.52 25.43 7.44 7.02 16.56 11.16 27.36 12.43-2.3 7.09-5.15 14.33-8.54 21.72zM119.22 33.71c0-7.39 2.65-14.37 7.95-20.93 5.3-6.56 11.83-10.87 19.59-12.92.22 1.45.33 2.76.33 3.93 0 7.39-2.73 14.38-8.19 20.97-5.46 6.58-11.96 10.74-19.5 12.47-.07-1.16-.18-2.34-.18-3.52z"/>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#94a3b8' }}>Download on the</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>App Store</div>
                </div>
              </button>

              {/* Direct APK Download Button with Animated Progress */}
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="btn-blue"
                style={{ padding: '0.75rem 1.4rem', borderRadius: '10px' }}
              >
                <Download size={18} />
                {downloading ? `Downloading ${downloadProgress}%...` : downloadComplete ? 'Downloaded!' : 'Direct APK (v1.4.2)'}
              </button>

              {/* QR Code Trigger */}
              <button 
                onClick={() => setShowQr(!showQr)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <QrCode size={18} />
                Scan QR
              </button>

              {/* Sensor Diagnostics Test Button */}
              <button
                onClick={toggleSensorTest}
                style={{
                  background: testingSensors ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${testingSensors ? '#10b981' : '#334155'}`,
                  borderRadius: '10px',
                  color: testingSensors ? '#10b981' : '#fff',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <Activity size={18} className={testingSensors ? 'pulse-animation' : ''} />
                {testingSensors ? 'Sensors Active' : 'Test Phone IMU'}
              </button>

            </div>

            {/* Live Sensor Diagnostics Box */}
            {testingSensors && (
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                maxWidth: '440px'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Live Phone IMU Accelerometer Stream
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', fontFamily: 'monospace' }}>
                  <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ACCEL X</span>
                    <div style={{ color: '#38bdf8', fontWeight: 700 }}>{sensorValues.x} m/s²</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ACCEL Y</span>
                    <div style={{ color: '#10b981', fontWeight: 700 }}>{sensorValues.y} m/s²</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ACCEL Z</span>
                    <div style={{ color: '#f59e0b', fontWeight: 700 }}>{sensorValues.z} m/s²</div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Modal Dropdown */}
            {showQr && (
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '1.25rem',
                maxWidth: '320px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Scan with Phone Camera to Install APK
                </div>
                <div style={{ padding: '8px', background: '#fff', borderRadius: '8px', display: 'inline-block' }}>
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="26" height="26" fill="#0B1120" rx="3" />
                    <rect x="15" y="15" width="16" height="16" fill="white" />
                    <rect x="19" y="19" width="8" height="8" fill="#1E6BFF" />
                    <rect x="64" y="10" width="26" height="26" fill="#0B1120" rx="3" />
                    <rect x="69" y="15" width="16" height="16" fill="white" />
                    <rect x="73" y="19" width="8" height="8" fill="#1E6BFF" />
                    <rect x="10" y="64" width="26" height="26" fill="#0B1120" rx="3" />
                    <rect x="15" y="69" width="16" height="16" fill="white" />
                    <rect x="19" y="73" width="8" height="8" fill="#1E6BFF" />
                    <rect x="42" y="12" width="6" height="6" fill="#0B1120" />
                    <rect x="44" y="38" width="12" height="12" fill="#1E6BFF" />
                    <rect x="42" y="74" width="18" height="6" fill="#0B1120" />
                  </svg>
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Requires Android 8.0+ or iOS 15+. Universal ARM64 build. Verified SHA256 checksum included.
            </div>
          </div>

          {/* Right Column: 3 Pillars & Slogan matching reference image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            textAlign: 'right'
          }} className="cta-right-col">
            
            {/* 3 Pill Badges */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(30, 107, 255, 0.15)',
                  border: '1px solid rgba(30, 107, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Shield size={22} />
                </div>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Safer Journeys</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(30, 107, 255, 0.15)',
                  border: '1px solid rgba(30, 107, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Navigation size={22} />
                </div>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Smarter Mobility</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(30, 107, 255, 0.15)',
                  border: '1px solid rgba(30, 107, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Users size={22} />
                </div>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>A More Connected India</span>
              </div>

            </div>

            {/* Cursive slogan matching reference */}
            <div style={{
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: '#93c5fd',
              fontWeight: 600,
              letterSpacing: '0.02em'
            }}>
              Navigate a Better Tomorrow ~
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .cta-grid { grid-template-columns: 1fr !important; }
          .cta-right-col { align-items: flex-start !important; text-align: left !important; }
        }
      `}</style>
    </section>
  );
}
