import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Compass, Cpu, Map, Zap, Crosshair, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';
import PhoneScreenMockup from './PhoneScreenMockup';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } } },
};

const features = [
  { icon: <Crosshair size={19} />, label: 'Works in GNSS-Denied Areas' },
  { icon: <Compass size={19} />, label: 'AI-Powered Accuracy' },
  { icon: <Map size={19} />, label: 'Lane Tracking & Map Match' },
  { icon: <Zap size={19} />, label: 'Seamless GNSS ↔ INS Fusion' },
];

export default function HeroSection({ onDownloadApk }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 } }); } catch (e) {}

      const link = document.createElement('a');
      link.href = '/navpulse-release-v1.4.2.apk';
      link.download = 'inav-v1.4.2.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloaded(false), 5000);
    }, 1200);
  };

  return (
    <section id="home" style={{
      backgroundColor: '#0a0f1d',
      padding: '4.5rem 0 5.5rem 0',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid #1e293b',
    }}>
      {/* Animated ambient background orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '10%', right: '8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,107,255,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '5%', left: '2%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3.5rem', alignItems: 'center' }} className="hero-content-grid">

          {/* ── Left Column ── */}
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={stagger.item} style={{ marginBottom: '1.25rem' }}>
              <motion.span
                className="badge-pill badge-pill-dark"
                animate={{ boxShadow: ['0 0 0 0 rgba(30,107,255,0)', '0 0 0 6px rgba(30,107,255,0.12)', '0 0 0 0 rgba(30,107,255,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Radio size={13} className="pulse-animation" /> AI-POWERED NAVIGATION
              </motion.span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={stagger.item}
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)', lineHeight: 1.1,
                fontWeight: 800, color: '#ffffff', marginBottom: '1.35rem',
                letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Keep Moving,{' '}
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                style={{
                  background: 'linear-gradient(135deg, #1e6bff 0%, #00d2ff 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Always
              </motion.span>{' '}
              On Track.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={stagger.item}
              style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 520 }}
            >
              iNav uses <span style={{ color: '#60a5fa', fontWeight: 600 }}>AI-ML Dead Reckoning</span> and sensor fusion to keep you navigating seamlessly even in tunnels, parking lots, urban canyons, and other GNSS-denied environments.
            </motion.p>

            {/* Download Buttons */}
            <motion.div
              variants={stagger.item}
              style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}
            >
              {/* Google Play */}
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-store"
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3.6 2.4L13.8 12L3.6 21.6C3.2 21.2 3 20.6 3 19.8V4.2C3 3.4 3.2 2.8 3.6 2.4Z" fill="#2196F3"/>
                  <path d="M17.2 8.8L13.8 12L17.2 15.2L20.8 13.2C21.6 12.8 21.6 11.2 20.8 10.8L17.2 8.8Z" fill="#FFC107"/>
                  <path d="M13.8 12L3.6 2.4C4.1 2 4.9 2.1 5.6 2.5L17.2 8.8L13.8 12Z" fill="#4CAF50"/>
                  <path d="M13.8 12L17.2 15.2L5.6 21.5C4.9 21.9 4.1 22 3.6 21.6L13.8 12Z" fill="#F44336"/>
                </svg>
                <div>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>GET IT ON</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Google Play</div>
                </div>
              </motion.button>

              {/* App Store */}
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-store"
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                <svg width="20" height="22" viewBox="0 0 170 170" fill="#ffffff">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.43-5.63-8.6-10.04-18.77-13.22-30.52-3.18-11.75-4.77-22.84-4.77-33.27 0-16.14 4.09-29.6 12.27-40.38 8.18-10.78 18.66-16.29 31.44-16.53 4.8 0 10.15 1.25 16.06 3.75 5.91 2.5 9.77 3.75 11.58 3.75 1.57 0 5.37-1.25 11.41-3.75 6.04-2.5 11.39-3.65 16.06-3.45 14.15.82 25.17 6.47 33.06 16.96-12.27 7.42-18.29 17.51-18.06 30.27.24 9.94 4.08 18.42 11.52 25.43 7.44 7.02 16.56 11.16 27.36 12.43-2.3 7.09-5.15 14.33-8.54 21.72zM119.22 33.71c0-7.39 2.65-14.37 7.95-20.93 5.3-6.56 11.83-10.87 19.59-12.92.22 1.45.33 2.76.33 3.93 0 7.39-2.73 14.38-8.19 20.97-5.46 6.58-11.96 10.74-19.5 12.47-.07-1.16-.18-2.34-.18-3.52z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>DOWNLOAD ON THE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>App Store</div>
                </div>
              </motion.button>

              {/* Direct APK */}
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="btn-blue"
                style={{ padding: '0.72rem 1.4rem', borderRadius: 10, cursor: 'pointer' }}
              >
                <AnimatePresence mode="wait">
                  {downloading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      Downloading...
                    </motion.span>
                  ) : downloaded ? (
                    <motion.span key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ✓ Downloaded!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> Direct APK (v1.4.2)
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            {/* Feature badges grid */}
            <motion.div
              variants={stagger.item}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
              className="hero-feature-row"
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200, damping: 22 }}
                  whileHover={{ scale: 1.06 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'default' }}
                >
                  <motion.div
                    whileHover={{ boxShadow: '0 0 20px rgba(30,107,255,0.4)' }}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      border: '1px solid rgba(30,107,255,0.4)', background: 'rgba(30,107,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#60a5fa', marginBottom: '0.5rem',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  >
                    {f.icon}
                  </motion.div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1.3 }}>
                    {f.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right Column: Phone Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <PhoneScreenMockup />
          </motion.div>

        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-content-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 580px) {
          .hero-feature-row { grid-template-columns: repeat(2, 1fr) !important; gap: 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
