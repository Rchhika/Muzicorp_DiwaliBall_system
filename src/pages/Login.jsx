import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      navigate('/portal', { replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login({ username, password });

    if (!result.ok) {
      setError(result.error ?? 'Invalid credentials provided.');
      return;
    }

    setTimeout(() => {
      navigate('/portal');
    }, 600);
  };

  if (!isHydrating && isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] px-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-brand-500)]/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-[var(--color-brand-900)]/20 to-transparent blur-[100px] rotate-45"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[var(--color-brand-900)]/20 to-transparent blur-[100px] -rotate-45"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="backdrop-blur-3xl bg-[#0a0a0a]/80 rounded-[2.5rem] p-10 md:p-12 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Subtle inner border glow */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-[var(--color-brand-500)]/10 pointer-events-none shadow-[inset_0_0_20px_rgba(212,175,55,0.02)]"></div>

          <div className="text-center mb-10 relative">
            <motion.div 
              className="w-28 h-28 mx-auto mb-8 relative flex items-center justify-center"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <div className="absolute inset-0 bg-[var(--color-brand-500)]/10 rounded-full blur-2xl transition-all duration-700"></div>
              <motion.img 
                src="/logo.png" 
                alt="Muzicorp Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] relative z-10"
                animate={{ rotate: isHovered ? 15 : 0, scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-[0.1em] uppercase text-glow">Secure Access</h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[var(--color-brand-500)] to-transparent mx-auto mb-4 opacity-50"></div>
            <p className="text-[#a1a1aa] text-sm font-light tracking-wide">Authenticate to retrieve your digital pass.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#52525b] group-focus-within:text-[var(--color-brand-500)] transition-colors duration-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#141414] border border-[#27272a] rounded-[1.25rem] py-4 pl-14 pr-5 text-white focus:outline-none focus:border-[var(--color-brand-500)]/50 focus:bg-[#1a1a1a] transition-all duration-500 placeholder-[#52525b] font-medium tracking-wide shadow-inner"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
               <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#52525b] group-focus-within:text-[var(--color-brand-500)] transition-colors duration-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141414] border border-[#27272a] rounded-[1.25rem] py-4 pl-14 pr-5 text-white focus:outline-none focus:border-[var(--color-brand-500)]/50 focus:bg-[#1a1a1a] transition-all duration-500 placeholder-[#52525b] font-medium tracking-wide shadow-inner"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="text-red-400 text-xs font-bold uppercase tracking-widest bg-red-500/5 p-4 rounded-[1rem] border border-red-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 relative group overflow-hidden rounded-[1.25rem] border border-[var(--color-brand-500)]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6b5718] via-[#d4af37] to-[#6b5718] opacity-80 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></div>
                
                {/* Button Inner Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"></div>

                <div className="relative flex items-center justify-center gap-2 text-[#0a0a0e] font-black uppercase tracking-[0.2em] text-sm">
                  Unlock Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                </div>
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#52525b] mb-4 font-bold">Test Access Credentials</span>
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-[#141414] rounded-lg text-xs font-mono text-[#a1a1aa] border border-[#27272a] shadow-inner">rohan.chhika</span>
              <span className="px-4 py-2 bg-[#141414] rounded-lg text-xs font-mono text-[#a1a1aa] border border-[#27272a] shadow-inner">password123</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global styles for the gradient button animation if needed, injected securely via a style tag for this component */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
