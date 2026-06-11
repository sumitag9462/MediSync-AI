import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Pill, Activity, Calendar, ShieldCheck, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingIcon = ({ icon: Icon, delay, top, left, size, color }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.to(ref.current, {
      y: 'random(-20, 20)',
      x: 'random(-10, 10)',
      rotation: 'random(-15, 15)',
      duration: 'random(3, 6)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay
    });
  }, [delay]);
  return (
    <div ref={ref} className={`absolute ${top} ${left} opacity-30 pointer-events-none drop-shadow-md`} style={{ color }}>
      <Icon size={size} />
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle, page, linkText, illustration }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    gsap.to(cardRef.current, {
      rotateX, rotateY, duration: 0.5, ease: 'power2.out', transformPerspective: 1200
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, 0.3)'
    });
  };

  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 30, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    gsap.fromTo('.auth-stagger', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center relative overflow-hidden font-sans selection:bg-purple-500/20">
      {/* Animated Background System - Light Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
        
        {/* Floating Icons */}
        <FloatingIcon icon={Activity} delay={0} top="top-[15%]" left="left-[10%]" size={32} color="#ec4899" />
        <FloatingIcon icon={Calendar} delay={1} top="top-[60%]" left="left-[8%]" size={40} color="#8b5cf6" />
        <FloatingIcon icon={ShieldCheck} delay={2} top="top-[25%]" left="right-[15%]" size={36} color="#06b6d4" />
        <FloatingIcon icon={HeartPulse} delay={1.5} top="top-[70%]" left="right-[10%]" size={44} color="#f43f5e" />
      </div>

      <div className="w-full max-w-5xl mx-auto p-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        <div className="hidden md:flex flex-col flex-1 text-left relative">
           <div className="inline-flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
                <Pill size={32} className="text-white" />
              </div>
              <span className="text-4xl font-bold tracking-tight text-slate-900">MediSync<span className="text-purple-600">-AI</span></span>
           </div>
           <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 drop-shadow-sm">
             Your Intelligent<br/>Healthcare Companion
           </h2>
           <p className="text-slate-600 text-xl max-w-md mb-12 leading-relaxed">
             Experience next-generation medical adherence with AI-powered insights, secure syncing, and precision reminders.
           </p>
           <div className="relative w-full max-w-xs aspect-square">
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl opacity-60" />
             {illustration}
           </div>
        </div>

        <div className="w-full max-w-md flex-1">
          <div className="md:hidden flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.3)] mb-4" onClick={() => navigate('/')}>
                <Pill size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">MediSync-AI</h1>
              <p className="text-slate-600 text-sm mt-2">{subtitle}</p>
          </div>

          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative p-8 sm:p-10 rounded-[2rem] bg-white/70 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="hidden md:block mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{title}</h2>
                <p className="text-slate-500 text-sm">{subtitle}</p>
              </div>
              
              <AnimatePresence mode="wait">
                  {children}
              </AnimatePresence>
            </div>
          </div>
          
          {page && linkText && (
            <p className="text-center mt-8 text-sm text-slate-500 font-medium">
              {page === '/login' ? "Already have an account?" : "Don't have an account?"}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(page); }} className="text-purple-600 hover:text-pink-600 font-bold transition-colors">
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
