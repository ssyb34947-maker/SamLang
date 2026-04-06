import React from 'react';
import {
  Navigation,
  Hero,
  Features,
  HowItWorks,
  Testimonials,
  CTA,
  Footer,
  ScrollToTop,
} from './sections';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sketch-bg)' }}>
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};
