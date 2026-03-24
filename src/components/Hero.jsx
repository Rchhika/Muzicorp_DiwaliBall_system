import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const EVENT_DATE = new Date('2026-10-24T19:00:00'); // Fictional future date for Diwali Ball

const Hero = () => {
  const { scrollY } = useScroll();
  const yStage = useTransform(scrollY, [0, 800], [0, 300]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = EVENT_DATE.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background parallax visual - Note: The user generated image path is abstract here since it is local artifact */}
      <motion.div 
        style={{ y: yStage }}
        className="absolute inset-0 w-full h-full z-0"
      >
         <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-[#110524]/60 to-transparent z-10" />
         <img 
            src="/background.png" 
            alt="Festival Stage" 
            className="w-full h-full object-cover opacity-80"
         />
      </motion.div>

      <motion.div 
        style={{ opacity: opacityText }}
        className="relative z-20 flex flex-col items-center text-center px-6 mt-16 max-w-4xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h2 className="text-[var(--color-brand-500)] font-bold tracking-widest uppercase mb-4 text-sm md:text-base">Muzicorp Presents</h2>
          <h1 className="text-5xl md:text-8xl font-black text-white text-glow mb-6 leading-tight">
            THE DIWALI <br /> BALL 2026
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto mb-12">
            An evening of light, luxury, and live performances.
          </p>
        </motion.div>

        {/* Countdown */}
        <div className="flex gap-4 md:gap-8 glass px-8 py-6 rounded-2xl mb-12 box-glow">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
              <span className="text-3xl md:text-5xl font-bold font-mono text-white tracking-widest">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-sm uppercase tracking-widest text-[#a698b5] mt-2">
                {unit}
              </span>
            </div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
           <Link
            to="/login"
            className="bg-[var(--color-brand-500)] text-white px-10 py-4 rounded-full font-bold text-lg 
                       shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:bg-[var(--color-brand-900)] transition-colors inline-block"
          >
            View My Tickets
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-10 z-20 text-gray-400"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ArrowDown className="w-8 h-8 opacity-50" />
      </motion.div>
    </section>
  );
};

export default Hero;
