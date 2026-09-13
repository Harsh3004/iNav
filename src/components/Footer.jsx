import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#070b14',
      borderTop: '1px solid #1e293b',
      padding: '2.5rem 0',
      color: '#94a3b8',
      fontSize: '0.85rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #1e6bff 0%, #00d2ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.85rem'
          }}>
            ▲
          </div>
          <span style={{ color: '#fff', fontWeight: 700 }}>iNav</span>
          <span>•</span>
          <span>ISRO Smart Vehicles Theme</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#home" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
          <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
          <a href="#demo" style={{ color: '#94a3b8', textDecoration: 'none' }}>Demo</a>
          <a href="#use-cases" style={{ color: '#94a3b8', textDecoration: 'none' }}>Use Cases</a>
          <a href="#download" style={{ color: '#94a3b8', textDecoration: 'none' }}>Download APK</a>
        </div>

        <div>
          © 2026 iNav. Built for seamless Dead Reckoning navigation.
        </div>
      </div>
    </footer>
  );
}
