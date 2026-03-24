import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Search, ChevronRight, Monitor, Laptop } from 'lucide-react';
import clsx from 'clsx';
import attendeesData from '../data/attendees.json';

const SeatingPlan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [highlightedTableId, setHighlightedTableId] = useState(null);

  // Process data to group by table
  const tableGroups = useMemo(() => {
    const groups = {};
    for (let i = 1; i <= 48; i++) { // Using 48 tables for a clean 6x8 grid
      groups[i] = {
        id: i,
        guests: [],
        capacity: 10
      };
    }
    
    attendeesData.forEach(guest => {
      if (groups[guest.tableId]) {
        groups[guest.tableId].guests.push(guest);
      }
    });
    
    return Object.values(groups);
  }, []);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const foundGuest = attendeesData.find(guest => 
        guest.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (foundGuest) {
        setHighlightedTableId(foundGuest.tableId);
        const table = tableGroups.find(t => t.id === foundGuest.tableId);
        setSelectedTable(table);
      } else {
        setHighlightedTableId(null);
      }
    } else {
      setHighlightedTableId(null);
    }
  }, [searchQuery, tableGroups]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setHighlightedTableId(table.id);
  };

  return (
    <section className="py-24 px-6 relative w-full flex justify-center bg-[var(--color-bg-dark)] overflow-hidden">
      <div className="max-w-[1400px] w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">Grand Ballroom</h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-[var(--color-brand-500)] to-transparent mx-auto rounded-full box-glow mb-8"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Find your table by name and see your tablemates for the evening.
          </p>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main Interactive Floor Plan */}
          <div className="w-full xl:w-[75%] glass rounded-[2.5rem] p-8 md:p-12 border border-white/5 relative bg-[#0a0514]/40 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[850px]">
            
            {/* Top Area: Stage & Screens */}
            <div className="w-full flex justify-between items-start mb-20 relative z-20 px-4 md:px-12">
               {/* Projector Left */}
               <div className="flex flex-col items-center gap-3">
                  <div className="w-32 md:w-48 h-2 bg-white/20 rounded-full box-glow"></div>
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <Monitor className="w-3 h-3" /> Screen
                  </div>
               </div>

               {/* Stage */}
               <div className="w-64 md:w-96 h-32 md:h-40 bg-gradient-to-b from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/5 border-2 border-[var(--color-brand-500)] rounded-xl flex items-center justify-center relative box-glow animate-pulse-slow">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-1 bg-[var(--color-brand-500)] mb-4 rounded-full"></div>
                    <span className="text-[var(--color-brand-500)] font-black tracking-[0.5em] uppercase text-sm md:text-lg">THE STAGE</span>
                    <div className="flex gap-2 mt-4">
                       {[1,2,3,4].map(i => <div key={i} className="w-6 h-4 bg-white/10 rounded-sm border border-white/5"></div>)}
                    </div>
                  </div>
               </div>

               {/* Projector Right */}
               <div className="flex flex-col items-center gap-3">
                  <div className="w-32 md:w-48 h-2 bg-white/20 rounded-full box-glow"></div>
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <Monitor className="w-3 h-3" /> Screen
                  </div>
               </div>
            </div>

            {/* Search Overlay */}
            <div className="max-w-md mx-auto mb-16 relative z-30">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-500)] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Find your table by name..." 
                  className="w-full bg-[var(--color-bg-dark)]/80 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 text-white transition-all backdrop-blur-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-y-12 gap-x-4 md:gap-x-8 relative z-10 px-2 md:px-8">
              {tableGroups.map((table, i) => {
                const isHighlighted = highlightedTableId === table.id;
                const isSelected = selectedTable?.id === table.id;

                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.05 }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Interaction Button */}
                    <button
                      onClick={() => handleTableClick(table)}
                      className={clsx(
                        "w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 relative group z-10",
                        isHighlighted 
                          ? "bg-[var(--color-brand-500)] border-white text-black shadow-[0_0_50px_rgba(212,175,55,1)] scale-125 z-20 ring-4 ring-white/30" 
                          : isSelected
                            ? "bg-white border-white text-black z-20 shadow-xl"
                            : "bg-black/40 border-white/20 text-white font-bold hover:bg-white/10 hover:border-white/40 hover:text-white"
                      )}
                    >
                      <span className="text-lg md:text-2xl font-black leading-none">{table.id}</span>
                      
                      {/* High-end pulse for spotlight */}
                      {isHighlighted && (
                        <>
                          <motion.div 
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-full bg-[var(--color-brand-500)] -z-10"
                          />
                          <div className="absolute top-[-2.8rem] left-1/2 -translate-x-1/2 px-3 py-1 text-[8px] font-bold bg-white text-black rounded-full whitespace-nowrap box-glow shadow-2xl pointer-events-none ring-1 ring-black/10">
                            FINDING TABLE...
                          </div>
                        </>
                      )}
                    </button>

                    {/* Tablemates Count Badge */}
                    {table.guests.length > 0 && !isHighlighted && (
                       <div className="absolute -top-1 -right-1 md:top-0 md:right-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold text-white border border-white/10">
                          {table.guests.length}
                       </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Floor Details / Decorations */}
            <div className="mt-20 flex justify-between items-center text-gray-600 border-t border-white/5 pt-8">
               <div className="flex gap-8">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10"></div>
                   <span className="text-[10px] uppercase tracking-widest">Available</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[var(--color-brand-500)]"></div>
                   <span className="text-[10px] uppercase tracking-widest text-[var(--color-brand-500)]">Your Selection</span>
                 </div>
               </div>
               <div className="text-[10px] uppercase tracking-[0.4em] font-light">Main Hall Entrance</div>
            </div>
          </div>

          {/* Table Details Sidebar */}
          <div className="w-full xl:w-[25%] sticky top-24">
            <AnimatePresence mode="wait">
              {selectedTable ? (
                <motion.div
                  key={selectedTable.id}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  className="glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden bg-[#0e0a1a]/60 backdrop-blur-2xl shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-brand-500)]/5 blur-[80px] rounded-full"></div>
                  
                  <div className="mb-8 relative z-10">
                    <span className="text-[var(--color-brand-500)] font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">Seating Assignment</span>
                    <h3 className="text-4xl md:text-5xl font-black text-white italic">T-{selectedTable.id}</h3>
                  </div>

                  <div className="space-y-4 mb-10 relative z-10">
                    <div className="flex items-center gap-4 text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-brand-500)]/20 flex items-center justify-center border border-[var(--color-brand-500)]/30">
                        <Users className="w-5 h-5 text-[var(--color-brand-500)]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Tablemates</p>
                        <p className="text-lg font-bold text-white">{selectedTable.guests.length} Guests</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-[var(--color-brand-500)] uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Guest Registry</h4>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedTable.guests.length > 0 ? (
                        selectedTable.guests.map((guest, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={guest.id} 
                            className={clsx(
                              "flex items-center justify-between p-4 rounded-xl border transition-all group",
                              searchQuery && guest.name.toLowerCase().includes(searchQuery.toLowerCase())
                                ? "bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                : "bg-white/5 border-transparent hover:border-white/10"
                            )}
                          >
                            <span className="text-white font-medium group-hover:translate-x-1 transition-transform">{guest.name}</span>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[var(--color-brand-500)]" />
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-sm italic">Table is currently empty.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-[2rem] p-10 border border-white/5 h-[600px] flex flex-col items-center justify-center text-center bg-[#070410]/50 shadow-inner"
                >
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 relative">
                    <MapPin className="w-10 h-10 text-gray-600" />
                    <div className="absolute inset-0 rounded-full border border-[var(--color-brand-500)]/20 animate-ping"></div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Table Details</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Enter your name in the search box or select a table from the floor plan to reveal the guest arrangements and seat availability.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeatingPlan;
