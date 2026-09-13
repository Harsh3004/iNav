import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SimulatorTrackSection from './components/SimulatorTrackSection';
import ApplicationsSection from './components/ApplicationsSection';
import FeaturesSection from './components/FeaturesSection';
import UseCasesSection from './components/UseCasesSection';
import DownloadCTA from './components/DownloadCTA';
import Footer from './components/Footer';

export default function App() {
  const scrollToDownload = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const el = document.getElementById('download');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onDownloadClick={scrollToDownload} />
      
      <main style={{ flex: 1 }}>
        <HeroSection onDownloadApk={scrollToDownload} />
        <SimulatorTrackSection />
        <ApplicationsSection />
        <FeaturesSection />
        <UseCasesSection />
        <DownloadCTA />
      </main>

      <Footer />
    </div>
  );
}
