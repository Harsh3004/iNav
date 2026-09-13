import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Navigation, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#simulator', label: 'Simulator' },
  { href: '#applications', label: 'Applications' },
  { href: '#features', label: 'Features' },
  { href: '#use-cases', label: 'Use Cases' },
];

export default function Navbar({ onDownloadClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      style={{
        backgroundColor: scrolled ? 'rgba(6,9,17,0.96)' : '#0a0f1d',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '1px solid #1e293b',
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0.85rem 0',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand */}
        <motion.a
          href="#"
          whileHover={{ scale: 1.03 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
        >
          <motion.div
            animate={{ boxShadow: ['0 0 8px rgba(30,107,255,0.4)', '0 0 18px rgba(30,107,255,0.7)', '0 0 8px rgba(30,107,255,0.4)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1e6bff 0%, #00d2ff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '1.1rem',
            }}
          >
            ▲
          </motion.div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: "'Space Grotesk', sans-serif" }}>
              iNav
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', letterSpacing: '0.03em' }}>Navigate Beyond Limits</div>
          </div>
        </motion.a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ color: '#ffffff' }}
              style={{
                color: '#94a3b8', fontWeight: 500, fontSize: '0.88rem',
                textDecoration: 'none', transition: 'color 0.2s',
                position: 'relative', paddingBottom: 4,
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="desktop-cta">
          <motion.a
            href="#download"
            onClick={onDownloadClick}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="btn-blue"
            style={{ borderRadius: 8, padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
          >
            <Download size={15} /> Download App
          </motion.a>
        </div>

        {/* Mobile toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
          className="mobile-menu-btn"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', backgroundColor: '#070b14', borderBottom: '1px solid #1e293b' }}
          >
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#download"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.06 }}
                onClick={() => { setMobileOpen(false); onDownloadClick?.(); }}
                className="btn-blue"
                style={{ textAlign: 'center' }}
              >
                <Download size={15} /> Download App
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .desktop-cta { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </motion.header>
  );
}
