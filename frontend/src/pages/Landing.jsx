import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Lenis from 'lenis';
import { 
  Pill, Activity, Calendar, Award, User, ChevronsRight, 
  BarChart2, BookOpen, Clock, ChevronDown, MessageSquare, 
  Menu, X, ArrowRight, Zap, BrainCircuit, HeartPulse, Send,
  CheckCircle2, ShieldCheck, Bell
} from 'lucide-react';
// import heroImg from '../assets/hero-img.png';
import apiClient from '../api/apiClient';
import FloatingElements from '../components/ui/FloatingElements';
import PhoneMockup from '../components/ui/PhoneMockup';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- Smooth Scroll Component ---
function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);
  return <>{children}</>;
}

// --- Contact Form (Formspree) ---
const ContactForm = () => {
  const [status, setStatus] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await apiClient.post('/contact/submit', data);
      if (response.data.success) {
        setStatus(response.data.message);
        form.reset();
      } else {
        setStatus(response.data.message || 'Oops! There was a problem submitting your form.');
      }
    } catch (error) {
      setStatus('Oops! There was a problem submitting your form.');
    } finally {
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="relative p-10 rounded-3xl overflow-hidden group text-left"
      style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 12px 32px rgba(139,92,246,0.06)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <h3 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: '#0f172a' }}>Get in Touch</h3>
      <p className="text-sm mb-8" style={{ color: '#64748b' }}>Have a question? Fill out the form below and we&apos;ll get back to you.</p>
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['name', 'email', 'phone', 'place'].map((field) => (
            <div key={field} className="relative">
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                className="w-full rounded-xl p-4 text-sm font-semibold focus:outline-none transition-all peer"
                style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', color: '#1e293b' }}
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-4 text-slate-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-600 peer-valid:top-1.5 peer-valid:text-[10px] pointer-events-none font-bold uppercase tracking-wider">
                {field === 'place' ? 'Location' : field}
              </label>
            </div>
          ))}
        </div>
        <div className="relative">
          <textarea
            name="message"
            rows="4"
            className="w-full rounded-xl p-4 text-sm font-semibold focus:outline-none transition-all peer"
            style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', color: '#1e293b' }}
            placeholder=" "
            required
          ></textarea>
          <label className="absolute left-4 top-4 text-slate-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-600 peer-valid:top-1.5 peer-valid:text-[10px] pointer-events-none font-bold uppercase tracking-wider">
            Your Query
          </label>
        </div>
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-purple-600 hover:bg-purple-700 rounded-full shadow-md overflow-hidden hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}
          >
            <span className="relative flex items-center gap-2">Send Message <Send size={18} className="group-hover:translate-x-1 transition-transform" /></span>
          </button>
        </div>
        {status && <p className="text-center text-sm font-bold text-purple-600 mt-4 animate-fade-in">{status}</p>}
      </form>
    </div>
  );
};

// --- Feature Card 3D ---
const FeatureCard3D = ({ icon, title, children }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(cardRef.current, {
      rotateX, rotateY, scale: 1.02, duration: 0.4, ease: "power2.out", transformPerspective: 1000
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0, rotateY: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.3)"
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="feature-card-anim opacity-0 translate-y-10 relative p-8 rounded-3xl overflow-hidden group cursor-pointer text-left"
      style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(139,92,246,0.06)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:text-pink-600 transition-colors group-hover:scale-110 duration-300"
          style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))' }}
        >
          {icon}
        </div>
        <h3 className="text-lg font-extrabold mb-2.5 tracking-tight" style={{ color: '#1e293b' }}>{title}</h3>
        <p className="leading-relaxed text-xs" style={{ color: '#64748b' }}>{children}</p>
      </div>
    </div>
  );
};

// --- Landing Page Main Component ---
const LandingPage = () => {
  const navigate = useNavigate();
  // const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const typeRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Navbar Scroll Effect
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (window.scrollY > 50) {
        nav.classList.add('bg-white/70', 'backdrop-blur-xl', 'border-b', 'border-slate-200/50', 'py-4');
        nav.classList.remove('py-6', 'bg-transparent');
      } else {
        nav.classList.remove('bg-white/70', 'backdrop-blur-xl', 'border-b', 'border-slate-200/50', 'py-4');
        nav.classList.add('py-6', 'bg-transparent');
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Initial Hero Animation
    const tl = gsap.timeline();
    
    // Headline animation without destroying HTML
    const headline = headlineRef.current;
    if (headline) {
        tl.fromTo(headline, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
    }

    // Typewriter effect
    if(typeRef.current) {
      tl.to(typeRef.current, {
        text: "Track your medications, monitor your health, and achieve your wellness goals with our intelligent AI system.",
        duration: 2,
        ease: "none",
      }, "-=0.2");
    }

    // Floating elements
    gsap.utils.toArray('.hero-float').forEach((el, i) => {
      gsap.to(el, {
        y: () => -20 - Math.random() * 20,
        rotation: () => Math.random() * 10 - 5,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2
      });
    });

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: "top 80%",
      onEnter: () => {
        stats.forEach(stat => {
          const target = parseFloat(stat.getAttribute('data-target'));
          gsap.to(stat, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            ease: "power2.out"
          });
        });
      },
      once: true
    });

    // Features Stagger Reveal
    gsap.to('.feature-card-anim', {
      scrollTrigger: { trigger: "#features", start: "top 75%" },
      opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out"
    });

    // Timeline Animation
    gsap.to('.timeline-progress', {
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
      height: "100%",
      ease: "none"
    });

    gsap.utils.toArray('.timeline-node').forEach((node, i) => {
      gsap.fromTo(node, 
        { opacity: 0, scale: 0.5, x: i % 2 === 0 ? -50 : 50 },
        {
          scrollTrigger: { trigger: node, start: "top 80%" },
          opacity: 1, scale: 1, x: 0, duration: 0.6, ease: "back.out(1.5)"
        }
      );
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <SmoothScroll>
      <div className="bg-[#f8f9ff] text-slate-800 min-h-screen font-sans overflow-x-hidden relative">
        
        {/* Animated Background System - Light Theme */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-pink-300/20 rounded-full blur-[140px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[45%] left-[55%] w-[45%] h-[45%] bg-cyan-200/35 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
          <div className="noise-bg absolute inset-0 opacity-40" />
        </div>

        {/* Navigation */}
        <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                <Pill size={24} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">MediSync<span className="text-purple-600">-AI</span></span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a href="#features" className="hover:text-slate-800 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-800 transition-colors">How it works</a>
              <a href="#ai" className="hover:text-slate-800 transition-colors">AI Engine</a>
              <a href="#contact" className="hover:text-slate-800 transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors">Log in</button>
              <button onClick={() => navigate('/register')} className="text-sm font-bold text-white px-5 py-2.5 rounded-full hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-slate-600 hover:text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl pt-24 px-6 md:hidden flex flex-col gap-6">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#ai" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-600 hover:text-slate-900">AI Engine</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-600 hover:text-slate-900">Contact</a>
            <div className="h-px w-full bg-slate-200/50 my-4" />
            <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="text-xl font-bold text-left text-slate-700">Log in</button>
            <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="text-xl font-bold text-white text-center py-4 rounded-2xl mt-4" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>Get Started</button>
          </div>
        )}

        {/* Main Content */}
        <main className="relative z-10">
          
          {/* Hero Section */}
          <section style={{ background: 'var(--bg-hero)', minHeight: '100vh',
            padding: '0 64px', position: 'relative', overflow: 'hidden' }}>

            <FloatingElements variant="landing" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 40, alignItems: 'center', minHeight: '100vh', maxWidth: 1280,
              margin: '0 auto', paddingTop: 80 }}>

              {/* ── LEFT COLUMN ── */}
              <div style={{ animation: 'fade-up 0.7s ease both' }}>
                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#EDE8FF', borderRadius: 'var(--radius-pill)',
                  padding: '6px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: '0.75rem' }}>✨</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-purple)' }}>AI-Powered Healthcare Assistant</span>
                </div>

                {/* Headline */}
                <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', fontWeight: 800,
                  color: 'var(--text-heading)', lineHeight: 1.15, marginBottom: 20 }}>
                  Your Health,<br/>
                  <span className="text-gradient">Intelligently</span><br/>
                  Managed
                </h1>

                {/* Subtitle */}
                <p style={{ fontSize: '1rem', color: 'var(--text-body)',
                  lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
                  MediSync-AI helps you manage medications, get AI health insights, and stay ahead of your health.
                </p>

                {/* CTA Row */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 36 }}>
                  <button onClick={() => navigate('/register')} className="btn-primary">
                    Get Started
                  </button>
                  <button onClick={() => document.getElementById('ai').scrollIntoView({behavior: 'smooth'})} className="btn-ghost">
                    Watch Demo
                  </button>
                </div>

                {/* Social Proof */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex' }}>
                    {['👤','👤','👤','👤'].map((a, i) => (
                      <div key={i} style={{ width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
                        border: '2px solid white', marginLeft: i === 0 ? 0 : -8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem' }}>{a}</div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600,
                      color: 'var(--text-heading)' }}>
                      Trusted by 10,000+ users worldwide
                    </p>
                    <div style={{ color: '#F59E0B', fontSize: '0.875rem' }}>★★★★★
                      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CENTER COLUMN ── */}
              <div style={{ display: 'flex', justifyContent: 'center',
                animation: 'scale-in 0.8s ease 0.2s both' }} className="hidden md:flex">
                <PhoneMockup />
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12,
                animation: 'fade-up 0.7s ease 0.3s both' }}>
                {[
                  { icon: '🔔', color: '#EDE8FF', iconColor: '#7C3AED',
                    title: 'Smart Reminders', sub: 'Never miss a dose' },
                  { icon: '🧠', color: '#E0F2FE', iconColor: '#0891B2',
                    title: 'AI Health Insights', sub: 'Personalized for you' },
                  { icon: '💊', color: '#ECFDF5', iconColor: '#059669',
                    title: 'Medicine Tracking', sub: 'Track with ease' },
                  { icon: '🔒', color: '#F5F3FF', iconColor: '#7C3AED',
                    title: 'Secure & Private', sub: 'Your data is safe' },
                ].map((f) => (
                  <div key={f.title} className="glass-card" style={{ padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem',
                        color: 'var(--text-heading)', marginBottom: 2 }}>{f.title}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{f.sub}</p>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: '50%',
                      background: f.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>
                      {f.icon}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Stats Section */}
          <section ref={statsRef} className="py-20 border-y" style={{ borderColor: 'rgba(139,92,246,0.06)', background: 'rgba(255,255,255,0.45)' }}>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[
                { label: "Active Users", value: "25", suffix: "k+" },
                { label: "Doses Tracked", value: "100", suffix: "m+" },
                { label: "AI Predictions", value: "99", suffix: "%" },
                { label: "Uptime", value: "99.9", suffix: "%" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="text-4xl md:text-5xl font-extrabold tracking-tighter" style={{ color: '#1e293b' }}>
                    <span className="stat-number" data-target={stat.value}>0</span>
                    <span className="text-purple-600">{stat.suffix}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-32 px-6 lg:px-12 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: '#0f172a' }}>Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">stay healthy.</span></h2>
                <p className="text-lg text-slate-500">A complete toolset designed for individuals who want precision, reliability, and intelligence in their daily routine.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard3D index={0} icon={<Clock />} title="Precision Reminders">
                  Customizable alerts that adapt to your timezone, sleep schedule, and daily routine automatically.
                </FeatureCard3D>
                <FeatureCard3D index={1} icon={<BrainCircuit />} title="AI Insights">
                  Our neural network analyzes your adherence patterns to predict and prevent missed doses before they happen.
                </FeatureCard3D>
                <FeatureCard3D index={2} icon={<BarChart2 />} title="Deep Analytics">
                  Visualize your wellness journey with beautiful, interactive charts that uncover hidden health trends.
                </FeatureCard3D>
                <FeatureCard3D index={3} icon={<ShieldCheck />} title="Privacy First">
                  Bank-grade encryption ensures your medical data remains strictly confidential and secure at all times.
                </FeatureCard3D>
                <FeatureCard3D index={4} icon={<Calendar />} title="Calendar Sync">
                  Seamlessly integrates with Google Calendar and Apple Calendar for a unified life schedule.
                </FeatureCard3D>
                <FeatureCard3D index={5} icon={<Zap />} title="Lightning Fast">
                  Built on a modern tech stack ensuring zero lag, instant syncing, and offline capabilities.
                </FeatureCard3D>
              </div>
            </div>
          </section>

          {/* AI Showcase Section */}
          <section id="ai" className="py-32 px-6 lg:px-12 relative overflow-hidden border-y text-left" style={{ borderColor: 'rgba(139,92,246,0.06)', background: 'rgba(255,255,255,0.4)' }}>
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-purple-600 mb-6 text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                >
                  <MessageSquare size={14} /> MediSync AI Engine
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: '#0f172a' }}>Talk to your data naturally.</h2>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: '#64748b' }}>
                  Stop navigating through complex menus. Just ask our AI assistant anything about your schedule, side effects, or health history, and get instant, accurate answers.
                </p>
                <ul className="space-y-4">
                  {[
                    "What did I miss yesterday?",
                    "Can I take Ibuprofen with Megaflam?",
                    "Reschedule my 9 AM dose to 10 AM today."
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 bg-white/60 border p-4 rounded-2xl text-sm font-semibold" style={{ borderColor: 'rgba(139,92,246,0.08)' }}>
                      <ArrowRight size={16} className="text-pink-500" /> &quot;{text}&quot;
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative rounded-3xl border shadow-xl overflow-hidden aspect-square md:aspect-video lg:aspect-square flex flex-col"
                style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.8)' }}
              >
                <div className="h-14 border-b flex items-center px-6 gap-3 bg-slate-50/50" style={{ borderColor: 'rgba(139,92,246,0.06)' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-450" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Assistant</span>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden relative">
                  <div className="self-end text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}
                  >
                    <p>I have a headache. Can I take aspirin right now?</p>
                  </div>
                  <div className="self-start text-slate-800 px-5 py-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md text-sm font-semibold"
                    style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.1)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit size={16} className="text-purple-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">MediSync AI</span>
                    </div>
                    <p className="leading-relaxed text-xs" style={{ color: '#475569' }}>Looking at your logs, you took Megaflam 15mg at 9:00 AM. It is generally not recommended to mix Aspirin with NSAIDs like Megaflam as it increases the risk of side effects. Please consult your doctor first.</p>
                  </div>
                </div>
                <div className="h-16 border-t bg-slate-50/50 flex items-center px-4" style={{ borderColor: 'rgba(139,92,246,0.06)' }}>
                  <div className="w-full h-10 border rounded-xl px-4 flex items-center text-xs font-semibold text-slate-400"
                    style={{ background: 'rgba(139,92,246,0.04)', borderColor: 'rgba(139,92,246,0.12)' }}
                  >
                    Ask AI anything...
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Timeline */}
          <section id="how-it-works" className="py-32 px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: '#0f172a' }}>How MediSync works.</h2>
              <p className="text-lg text-slate-500">A frictionless experience from onboarding to daily mastery.</p>
            </div>

            <div ref={timelineRef} className="max-w-4xl mx-auto relative pb-10">
              {/* Background Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 transform md:-translate-x-1/2" />
              {/* Animated Progress Line */}
              <div className="timeline-progress absolute left-8 md:left-1/2 top-0 w-[3px] bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 transform md:-translate-x-1/2 h-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />

              {[
                { title: "Create Your Profile", desc: "Sign up securely in seconds. No complex setups or endless forms." },
                { title: "Add Medications", desc: "Input your prescriptions. We handle the complex scheduling logic automatically." },
                { title: "Get Notified", desc: "Receive intelligent, timely reminders on your phone, watch, or browser." },
                { title: "Track & Optimize", desc: "View detailed analytics and let AI suggest improvements to your routine." }
              ].map((step, i) => (
                <div key={i} className={`timeline-node relative flex items-center mb-20 md:mb-32 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="absolute left-8 md:left-1/2 w-6 h-6 rounded-full bg-[#f8f9ff] border-4 border-purple-500 transform -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
                  <div className={`ml-20 md:ml-0 w-full md:w-1/2 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                    <div className="p-8 rounded-3xl transition-colors text-left"
                      style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(139,92,246,0.06)' }}
                    >
                      <span className="text-purple-600 font-mono font-bold mb-2 block text-xs">Step 0{i+1}</span>
                      <h3 className="text-xl font-extrabold mb-3 tracking-tight" style={{ color: '#1e293b' }}>{step.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials Marquee */}
          <section className="py-20 border-y" style={{ borderColor: 'rgba(139,92,246,0.06)', background: 'rgba(255,255,255,0.45)' }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Loved by thousands.</h2>
            </div>
            
            <div className="relative w-full flex overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f8f9ff] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f8f9ff] to-transparent z-10 pointer-events-none" />
              
              <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
                {[1,2,3,4,5,6].map((_, i) => (
                  <div key={i} className="inline-block w-[350px] md:w-[450px] mx-4 p-6 rounded-3xl whitespace-normal text-left"
                    style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(139,92,246,0.06)' }}
                  >
                    <div className="flex items-center gap-1 mb-4 text-yellow-500">
                      {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                    </div>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">&quot;Absolutely life-changing app. The AI predictions saved me from mixing incompatible meds. The UI is gorgeous and perfectly smooth.&quot;</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                         {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Verified User</p>
                        <p className="text-xs text-slate-400 font-bold">Patient</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-32 px-6 lg:px-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-12 text-center tracking-tight" style={{ color: '#0f172a' }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is MediSync-AI completely free?", a: "Yes! Our core tracking and AI assistant features are currently free to use." },
                { q: "How secure is my medical data?", a: "We use end-to-end encryption. Your data is stored securely and never sold to third parties." },
                { q: "Does it sync with Google Calendar?", a: "Yes, you can easily connect your Google Calendar in the dashboard to mirror your schedule." },
                { q: "What if I miss a dose?", a: "The system logs it as missed and the AI adapts your adherence score, optionally offering advice on next steps." }
              ].map((faq, i) => (
                <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300 text-left"
                  style={{ background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(139,92,246,0.06)' }}
                >
                  <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-extrabold text-slate-800 text-base">{faq.q}</span>
                    <ChevronDown size={20} className={`transform transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-purple-600' : 'text-slate-400'}`} />
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-650 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA & Contact */}
          <section id="contact" className="py-32 relative text-left">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tighter text-slate-900">Ready to sync your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">health routine?</span></h2>
                  <p className="text-xl text-slate-550 mb-10">Join thousands of users who have transformed their medical adherence with our intelligent platform.</p>
                  <button onClick={() => navigate('/register')} className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 rounded-full hover:scale-105 shadow-md"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}
                  >
                    <span className="relative flex items-center gap-2 text-lg">Create Free Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                  </button>
                </div>
                <div>
                  <ContactForm />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Minimal Premium Footer */}
        <footer className="pt-16 pb-8 px-6 lg:px-12 relative z-10 border-t" style={{ borderColor: 'rgba(139,92,246,0.06)', background: 'rgba(255,255,255,0.45)' }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Pill size={20} className="text-purple-600" />
              <span className="text-lg font-bold tracking-tight text-slate-900">MediSync-AI</span>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-500 font-medium">
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-purple-600 transition-colors">GitHub</a>
            </div>
            
            <div className="text-sm text-slate-400 font-semibold">
              &copy; {new Date().getFullYear()} MediSync-AI. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroll>
  );
};

export default LandingPage;
