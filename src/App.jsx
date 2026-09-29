import React from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/hero.jsx';
import Stats from './components/Stats.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Safety from './components/Safety.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats/>
      <HowItWorks/>
      <Safety/>
      <Footer/>
    </div>
  );
}

export default App;