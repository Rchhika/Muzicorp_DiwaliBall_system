import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Home as HomeIcon, LogOut, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Portal', path: isAuthenticated ? '/portal' : '/login', icon: Ticket },
    { name: 'Staff', path: '/staff', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <motion.nav 
      className="fixed w-full z-50 top-0 px-4 py-6 md:px-8 md:py-6 pointer-events-none"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={clsx(
        "max-w-7xl mx-auto rounded-[2rem] px-5 py-3 flex justify-between items-center transition-all duration-500 pointer-events-auto",
        scrolled 
          ? "bg-[#0a0a0e]/80 backdrop-blur-2xl border border-[var(--color-brand-500)]/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]" 
          : "bg-transparent border border-transparent"
      )}>
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 bg-[var(--color-brand-500)] blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
            <img 
              src="/logo.png" 
              alt="Muzicorp Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] relative z-10 transform group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span className="font-black tracking-[0.2em] uppercase text-sm text-white group-hover:text-[var(--color-brand-500)] transition-colors duration-500 leading-none mb-1">Muzicorp</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold leading-none">The Diwali Ball</span>
          </div>
        </Link>
        <div className="flex gap-2 items-center">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.path ||
              (link.path === '/login' && location.pathname === '/portal') ||
              (link.path === '/portal' && location.pathname === '/portal') ||
              (link.path === '/staff' && location.pathname === '/staff');
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={clsx(
                  "px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-500 text-xs font-bold uppercase tracking-widest",
                  isActive 
                    ? "bg-gradient-to-r from-[var(--color-brand-900)] to-[var(--color-brand-500)] text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[var(--color-brand-500)]/50" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{link.name}</span>
              </Link>
            )
          })}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className={clsx(
                "px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-500 text-xs font-bold uppercase tracking-widest",
                "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
