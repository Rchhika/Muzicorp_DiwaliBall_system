import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ExternalLink } from 'lucide-react';

const hotels = [
  {
    name: "The Grand Plaza",
    distance: "0.2 miles from venue",
    rating: 5,
    price: "$$$",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  },
  {
    name: "City Suites",
    distance: "0.5 miles from venue",
    rating: 4,
    price: "$$",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  },
  {
    name: "Boutique Inn",
    distance: "1.0 miles from venue",
    rating: 4,
    price: "$$",
    image: "https://images.unsplash.com/photo-1542314831-c6a4d27ce668?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  }
];

const Accommodation = () => {
  return (
    <section className="py-24 px-6 w-full flex justify-center bg-[#0d0d12]">
      <div className="max-w-6xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Stay Nearby</h2>
          <div className="h-1 w-24 bg-[var(--color-brand-500)] mx-auto rounded-full box-glow mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We've partnered with local luxury hotels to ensure your evening ends as comfortably as it begins.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="glass rounded-2xl overflow-hidden group border border-[var(--color-border-dark)] hover:border-[var(--color-brand-500)]/50 transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-brand-500)] transition-colors">{hotel.name}</h3>
                  <div className="flex">
                    {[...Array(hotel.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[var(--color-brand-500)] text-[var(--color-brand-500)]" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-400 text-sm mb-6">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hotel.distance}
                </div>
                
                <a 
                  href={hotel.link}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-[var(--color-brand-500)] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  Book Now <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Accommodation;
