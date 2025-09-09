import React from 'react';
import Header from '../layout/Header';
import Hero from '../sections/Hero';
import Features from '../sections/Features';
import Testimonials from '../sections/Testimonials';
import Footer from '../layout/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;