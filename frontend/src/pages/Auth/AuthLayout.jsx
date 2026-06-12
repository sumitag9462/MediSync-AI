import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Pill, Activity, Calendar, ShieldCheck, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, page, linkText, illustration }) => {
  const navigate = useNavigate();
  const leftPanelRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.auth-stagger', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo(leftPanelRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-page)', fontFamily: 'var(--font-sans)' }}>
      
      {/* Left Panel (Illustration) */}
      <div 
        ref={leftPanelRef}
        className="hidden md:flex flex-col"
        style={{
          flex: 1, background: 'var(--bg-hero)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: 40, borderRight: '1px solid var(--border-card)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Floating Elements / Decorative */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[100px]" />
           <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-pink-200/40 rounded-full blur-[100px]" />
        </div>

        <div className="z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Pill size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MediSync<span className="text-purple-600">-AI</span></span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500 text-base font-medium leading-relaxed max-w-sm mb-12">{subtitle}</p>

          <div className="w-full flex items-center justify-center mt-8">
            {illustration ? illustration : (
              // Enhanced CSS Doctor
              <div className="relative w-full aspect-square max-w-xs flex items-center justify-center animate-float">
                 <div className="absolute bottom-4 w-48 h-12 bg-purple-200/50 rounded-[100%] blur-sm border border-purple-300/30" style={{ transform: 'rotateX(70deg)' }} />
                 <div className="absolute bottom-6 w-40 h-10 bg-white/80 rounded-[100%] border border-purple-100 shadow-lg" style={{ transform: 'rotateX(70deg)' }} />
                 <div className="relative w-40 h-40 bg-white rounded-full shadow-[0_20px_40px_rgba(139,92,246,0.2)] border border-purple-50 flex items-center justify-center z-10">
                    <span className="text-7xl">👨‍⚕️</span>
                 </div>
                 {/* Floating Badges */}
                 <div className="absolute top-4 left-0 animate-float" style={{ animationDelay: '1s' }}><span className="text-3xl drop-shadow-md">💊</span></div>
                 <div className="absolute top-16 right-0 animate-float" style={{ animationDelay: '0.5s' }}><span className="text-4xl drop-shadow-md">🩺</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div 
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'var(--bg-card)', padding: '40px 20px',
          position: 'relative'
        }}
      >
        <div className="w-full max-w-md flex flex-col justify-center">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md mb-4" onClick={() => navigate('/')}>
              <Pill size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">{subtitle}</p>
          </div>

          <div className="hidden md:block mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-base text-slate-500 font-medium">{subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>

          {page && linkText && (
            <p className="text-center mt-10 text-sm text-slate-500 font-medium auth-stagger">
              {page === '/login' ? "Already have an account?" : "Don't have an account?"}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(page); }} className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                  {linkText}
              </a>
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
