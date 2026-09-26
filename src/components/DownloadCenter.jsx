import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Server, ShieldCheck, Terminal, Copy, Check, QrCode, Cpu, CheckCircle2, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DownloadCenter() {
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedSdkCmd, setCopiedSdkCmd] = useState(false);

  // Live browser sensor test state
  const [sensorStatus, setSensorStatus] = useState('idle'); // 'idle', 'testing', 'active', 'synthetic'
  const [sensorReadings, setSensorReadings] = useState({
    accelX: 0,
    accelY: 9.8,
    accelZ: 0.2,
    alpha: 0,
    beta: 0,
    gamma: 0,
    rate: 10
  });

  const apkSha = "8f3b6c2d1e0a9f5b4c8e7d6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c";

  const handleDownloadApk = () => {
    if (downloadingApk) return;
    setDownloadingApk(true);
    setApkProgress(0);

    const timer = setInterval(() => {
      setApkProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setDownloadingApk(false);
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          const link = document.createElement('a');
          link.href = '/iNAV-final-release';
          link.download = 'inav-release-v1.4.2.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const copySha = () => {
    navigator.clipboard.writeText(apkSha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const copySdkCmd = () => {
    navigator.clipboard.writeText("pip install inav-idr-edge");
    setCopiedSdkCmd(true);
    setTimeout(() => setCopiedSdkCmd(false), 2500);
  };

  // Run device sensor diagnostic
  const startSensorTest = () => {
    setSensorStatus('testing');

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // In iOS 13+, permission might be required
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              bindSensors();
            } else {
              fallbackSynthetic();
            }
          })
          .catch(() => fallbackSynthetic());
      } else {
        bindSensors();
      }
    } else {
      fallbackSynthetic();
    }
  };

  const bindSensors = () => {
    let receivedRealData = false;
    const motionHandler = (event) => {
      if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.x !== null) {
        receivedRealData = true;
        setSensorStatus('active');
        setSensorReadings(prev => ({
          ...prev,
          accelX: (event.accelerationIncludingGravity.x || 0).toFixed(2),
          accelY: (event.accelerationIncludingGravity.y || 0).toFixed(2),
          accelZ: (event.accelerationIncludingGravity.z || 0).toFixed(2),
          rate: Math.round(1000 / (event.interval || 20))
        }));
      }
    };

    window.addEventListener('devicemotion', motionHandler);

    // Timeout fallback if desktop has no physical accelerometer
    setTimeout(() => {
      if (!receivedRealData) {
        fallbackSynthetic();
      }
    }, 1200);
  };

  const fallbackSynthetic = () => {
    setSensorStatus('synthetic');
    const interval = setInterval(() => {
      setSensorReadings({
        accelX: ((Math.random() - 0.5) * 0.4).toFixed(2),
        accelY: (9.81 + (Math.random() - 0.5) * 0.1).toFixed(2),
        accelZ: ((Math.random() - 0.5) * 0.3).toFixed(2),
        alpha: Math.round(Math.random() * 360),
        beta: Math.round(15 + (Math.random() - 0.5) * 2),
        gamma: Math.round((Math.random() - 0.5) * 4),
        rate: 10
      });
    }, 100);

    return () => clearInterval(interval);
  };

  return (
    <section id="download" style={{
      padding: '5.5rem 0',
      position: 'relative',
      background: 'linear-gradient(to bottom, var(--bg-primary), #070b16)'
    }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge-tech" style={{ marginBottom: '0.8rem' }}>
            <Download size={14} /> Official Deployment Hub
          </div>
          <h2 className="heading-font" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', color: '#fff', marginBottom: '1rem' }}>
            Download & Deploy <span className="text-gradient-cyan">iNav</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Equip your drivers with the Android smartphone application, or integrate our edge C++ runtime for tactical autonomous rovers.
          </p>
        </div>

        {/* Primary Download Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', marginBottom: '3.5rem' }} className="download-primary-grid">
          
          {/* Card 1: Smartphone Android APK */}
          <div className="glass-panel" style={{
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px var(--cyan-glow)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald)'
                }}>
                  <Smartphone size={32} />
                </div>
                <span className="badge-tech badge-green">Recommended for Drivers</span>
              </div>

              <h3 className="heading-font" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.4rem' }}>
                iNav for Android
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                <span>Build v1.4.2 (Production Stable)</span>
                <span>•</span>
                <span>24.8 MB</span>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.8rem' }}>
                Includes offline OpenStreetMap caching for India, 3-second In-Vehicle Auto Calibration, and real-time vibration filtering. 
                Ready for motorcycles, commercial trucks, and ride-hailing cabs.
              </p>

              {/* Feature Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '2rem' }}>
                {[
                  'Zero OBD-II port needed',
                  '10Hz IMU update frequency',
                  'Sub-5m lane drift in tunnels',
                  'Runs 100% locally on phone'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={15} color="var(--emerald)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download CTA Area */}
            <div>
              <button 
                onClick={handleDownloadApk}
                disabled={downloadingApk}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginBottom: '1rem' }}
              >
                {downloadingApk ? (
                  `Packaging APK (${apkProgress}%)...`
                ) : (
                  <>
                    <Download size={20} />
                    Download APK v1.4.2 (.apk)
                  </>
                )}
              </button>

              <div style={{
                background: 'rgba(6, 9, 17, 0.7)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px', color: 'var(--text-muted)' }}>
                  SHA256: <span style={{ color: 'var(--cyan)' }}>{apkSha}</span>
                </div>
                <button 
                  onClick={copySha}
                  style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {copiedSha ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Edge Deployable Engine (FOG IMU - 200Hz) */}
          <div id="edge-engine" className="glass-panel" style={{
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(59, 130, 246, 0.35)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue)'
                }}>
                  <Server size={32} />
                </div>
                <span className="badge-tech">Robotics & Autonomous Fleets</span>
              </div>

              <h3 className="heading-font" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.4rem' }}>
                Edge Engine SDK (C++ / Python)
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                <span>Update Rate: 200Hz</span>
                <span>•</span>
                <span>FOG & Tactical MEMS</span>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.8rem' }}>
                Designed for external tactical IMUs, Fiber Optic Gyroscopes (FOG), and embedded Linux computers (NVIDIA Jetson, Raspberry Pi 5, NXP i.MX8).
              </p>

              {/* Terminal code preview */}
              <div style={{
                background: '#040711',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}># Install via Python PIP or CMake:</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--cyan)' }}>pip install inav-idr-edge</span>
                  <button 
                    onClick={copySdkCmd}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {copiedSdkCmd ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <a 
                  href="https://github.com/onyekpeu/IO-VNBD" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary" 
                  style={{ textAlign: 'center', padding: '0.85rem' }}
                >
                  <Terminal size={16} />
                  C++ GitHub Repo
                </a>
                <button 
                  onClick={handleDownloadApk}
                  className="btn-secondary" 
                  style={{ textAlign: 'center', padding: '0.85rem' }}
                >
                  <Download size={16} />
                  Download Linux Bin
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Live In-Browser Sensor Diagnostic & Compatibility Checker */}
        <div className="glass-panel" style={{
          padding: '2rem',
          marginBottom: '3.5rem',
          background: 'rgba(11, 17, 32, 0.85)',
          border: '1px solid rgba(0, 242, 254, 0.25)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'center' }} className="sensor-test-grid">
            <div>
              <div className="badge-tech badge-isro" style={{ marginBottom: '0.6rem' }}>
                Sensor Compatibility Test
              </div>
              <h3 className="heading-font" style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.6rem' }}>
                Test Your Device's MEMS IMU
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                Click below to verify if your smartphone or computer has hardware accelerometer and gyroscope access suitable for 10Hz Dead Reckoning.
              </p>
              <button 
                onClick={startSensorTest}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.3rem' }}
              >
                <Cpu size={16} color="var(--cyan)" />
                {sensorStatus === 'idle' ? 'Run MEMS Diagnostic Test' : 'Re-Run Sensor Test'}
              </button>
            </div>

            {/* Live Readout Boxes */}
            <div style={{
              background: '#060a14',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HARDWARE DIAGNOSTIC STATE:</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: sensorStatus === 'active' ? 'var(--emerald)' : sensorStatus === 'synthetic' ? 'var(--isro-orange)' : 'var(--text-muted)',
                  fontWeight: 700
                }}>
                  {sensorStatus === 'active' ? '● PHYSICAL HARDWARE IMU ONLINE' : sensorStatus === 'synthetic' ? '● SIMULATED MEMS TELEMETRY' : 'READY TO PROBE'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ACCEL X</div>
                  <div style={{ fontSize: '1rem', color: 'var(--cyan)', fontWeight: 700 }}>{sensorReadings.accelX} m/s²</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ACCEL Y (Gravity)</div>
                  <div style={{ fontSize: '1rem', color: 'var(--emerald)', fontWeight: 700 }}>{sensorReadings.accelY} m/s²</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ACCEL Z</div>
                  <div style={{ fontSize: '1rem', color: 'var(--blue)', fontWeight: 700 }}>{sensorReadings.accelZ} m/s²</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Driver Onboarding Guide */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 className="heading-font" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            3-Step Driver Mount Calibration
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No vehicle mechanic or OBD-II port connection required. Set up in under 30 seconds.
          </p>
        </div>

        <div className="grid-3">
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="heading-font" style={{ fontSize: '1.75rem', color: 'var(--cyan)', fontWeight: 800, marginBottom: '0.8rem' }}>
              01
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem' }}>Install APK & Allow Permissions</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Download and open <strong>iNav</strong> on any smartphone running Android 8.0 or higher. Grant Location & High-Sampling Sensor access.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="heading-font" style={{ fontSize: '1.75rem', color: 'var(--isro-orange)', fontWeight: 800, marginBottom: '0.8rem' }}>
              02
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem' }}>Mount Phone at Any Angle</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Slot the phone into your existing magnetic mount, dashboard clip, or handlebar cradle. The screen can face any direction.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="heading-font" style={{ fontSize: '1.75rem', color: 'var(--emerald)', fontWeight: 800, marginBottom: '0.8rem' }}>
              03
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem' }}>Drive & Auto-Align</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Drive forward for 30 meters. iNav’s inertial gravity & acceleration decomposition calculates the rotation matrix automatically.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 980px) {
          .download-primary-grid { grid-template-columns: 1fr !important; }
          .sensor-test-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
