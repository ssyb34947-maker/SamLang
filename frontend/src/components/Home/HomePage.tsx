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
import { DemoSection } from './components';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

export const HomePage: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <Navigation />
          <main>
            <Hero />
            <Features />
            <DemoSection />
            <HowItWorks />
            <Testimonials />
            <CTA />
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
};
