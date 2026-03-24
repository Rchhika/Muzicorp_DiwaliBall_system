import React from 'react';
import { motion } from 'framer-motion';

const schedule = [
  { time: '18:30', title: 'Doors Open', desc: 'Welcome drinks & Canapés.' },
  { time: '19:30', title: 'Opening Ceremony', desc: 'Lighting of the Diyas.' },
  { time: '20:00', title: 'Dinner Served', desc: 'Three-course luxury Indian banquet.' },
  { time: '21:30', title: 'Live Performances', desc: 'Headline act featuring top artists.' },
  { time: '23:00', title: 'Afterparty Sets', desc: 'DJ sets with live dhol.' },
  { time: '01:00', title: 'Carriages', desc: 'Event concludes.' },
];

const Programme = () => {
  return (
    <section className="py-24 px-6 relative z-10 w-full flex justify-center bg-[var(--color-bg-dark)]">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Event Programme</h2>
          <div className="h-1 w-24 bg-[var(--color-brand-500)] mx-auto rounded-full box-glow"></div>
        </motion.div>

        <div className="relative border-l border-[var(--color-border-dark)] ml-4 md:ml-0 md:border-l-0">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--color-border-dark)] -translate-x-1/2"></div>
          
          {schedule.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`mb-12 relative flex w-full flex-col md:flex-row items-start md:items-center ${
                index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
              }`}
            >
              <div className="absolute left-[-21px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[var(--color-brand-500)] shadow-[0_0_10px_rgba(212,175,55,0.8)] border-4 border-black z-10"></div>
              
              <div className={`pl-8 md:pl-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                <div className="glass p-6 rounded-2xl hover:bg-[var(--color-bg-surface-elevated)] transition-colors group">
                  <span className="text-[var(--color-brand-500)] font-mono text-lg font-bold group-hover:text-glow transition-all">{item.time}</span>
                  <h3 className="text-2xl font-bold mt-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 mt-2 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programme;
