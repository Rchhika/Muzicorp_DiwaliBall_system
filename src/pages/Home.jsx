import React from 'react';
import Hero from '../components/Hero';
import Programme from '../components/Programme';
import Accommodation from '../components/Accommodation';
import SeatingPlan from '../components/SeatingPlan';

const Home = () => {
  return (
    <div className="w-full flex flex-col bg-[var(--color-bg-dark)] min-h-screen font-sans text-gray-200">
      <Hero />
      <Programme />
      <Accommodation />
      <SeatingPlan />
    </div>
  );
};

export default Home;
