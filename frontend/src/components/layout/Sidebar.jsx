import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Settings, BarChart2, ChevronLeft, ChevronRight, Pill, History as HistoryIcon, MapPin, Camera, FileText, Shield, QrCode, Mic, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, currentPage, isSidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: <Home size={20} />, page: 'dashboard' },
        { name: 'Safety', icon: <Shield size={20} />, page: 'safety-dashboard' },
        { name: 'Scan Rx', icon: <Camera size={20} />, page: 'ocr-upload' },
        { name: 'Schedules', icon: <Calendar size={20} />, page: 'schedules' },
        { name: 'OCR History', icon: <FileText size={20} />, page: 'ocr-history' },
        { name: 'History', icon: <HistoryIcon size={20} />, page: 'history' },
        { name: 'Analytics', icon: <BarChart2 size={20} />, page: 'analytics' },
        { name: 'Caregiver', icon: <Users size={20} />, page: 'collaboration' },
        { name: 'Voice Journal', icon: <Mic size={20} />, page: 'journal' },
        { name: 'Nearby Clinic', icon: <MapPin size={20} />, page: 'nearbyclinic' },
        { name: 'Emergency QR', icon: <QrCode size={20} />, page: 'emergency-card' },
        { name: 'Settings', icon: <Settings size={20} />, page: 'settings' },
    ];

    const sidebarVariants = {
        open: { width: '240px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isSidebarOpen ? "open" : "closed"}
            style={{
                minHeight: '100vh',
                background: 'var(--bg-sidebar)',
                boxShadow: 'var(--shadow-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 12px',
                position: 'fixed',
                left: 0, top: 0, bottom: 0,
                zIndex: 100,
                borderRight: '1px solid var(--border-card)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', marginBottom: 32, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center"
                        >
                            <span style={{ color: 'var(--text-heading)' }}>MediSync-</span>
                            <span style={{ color: 'var(--text-purple)' }}>AI</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navItems.map(item => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate(`/${item.page}`); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '11px 16px', borderRadius: 12,
                            fontSize: '0.9rem', fontWeight: currentPage === item.page ? 600 : 500,
                            cursor: 'pointer', textDecoration: 'none',
                            transition: 'all 0.2s ease', marginBottom: 2,
                            color: currentPage === item.page ? '#FFFFFF' : 'var(--text-body)',
                            background: currentPage === item.page ? 'var(--sidebar-active)' : 'transparent',
                            boxShadow: currentPage === item.page ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                        }}
                        onMouseEnter={e => { if (currentPage !== item.page) { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; e.currentTarget.style.color = 'var(--text-purple)'; } }}
                        onMouseLeave={e => { if (currentPage !== item.page) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-body)'; } }}
                        title={item.name}
                    >
                        {currentPage === item.page && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                            />
                        )}
                        {item.icon}
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="ml-4 font-medium whitespace-nowrap text-sm"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </a>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '12px 16px', background: 'rgba(139,92,246,0.04)', borderRadius: 12, border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {user?.photo ? (
                        <img
                            className="h-full w-full object-cover"
                            src={user.photo.startsWith('/uploads') ? user.photo : `/uploads${user.photo}`}
                            alt=""
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`; }}
                        />
                    ) : (
                        <img
                            className="h-full w-full object-cover"
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                            alt=""
                        />
                    )}
                </div>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col text-left overflow-hidden"
                    >
                        <span className="text-sm font-extrabold text-slate-800 truncate">{user?.name}</span>
                        <span className="text-xs text-slate-400">Patient</span>
                    </motion.div>
                )}
            </div>

            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="absolute -right-3 top-6 p-1.5 rounded-full border shadow-md focus:outline-none transition-transform hover:scale-110"
                style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(139,92,246,0.15)', color: '#7c3aed' }}
            >
                {isSidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>
        </motion.div>
    );
};

export default Sidebar;
