import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Settings, BarChart2, ChevronLeft, ChevronRight, Pill, History as HistoryIcon, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, currentPage, isSidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: <Home size={20} />, page: 'dashboard' },
        { name: 'Schedules', icon: <Calendar size={20} />, page: 'schedules' },
        { name: 'History', icon: <HistoryIcon size={20} />, page: 'history' },
        { name: 'Analytics', icon: <BarChart2 size={20} />, page: 'analytics' },
        { name: 'Nearby Clinic', icon: <MapPin size={20} />, page: 'nearbyclinic' },
        { name: 'Settings', icon: <Settings size={20} />, page: 'settings' },
    ];

    const sidebarVariants = {
        open: { width: '256px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isSidebarOpen ? "open" : "closed"}
            className="flex flex-col h-full relative"
            style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.5)'
            }}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b" style={{ borderColor: 'rgba(139,92,246,0.06)' }}>
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm">
                                <Pill size={14} className="text-white" />
                            </div>
                            <span className="text-lg font-extrabold ml-2" style={{ color: '#0f172a' }}>MediSync-AI</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-2">
                {navItems.map(item => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate(`/${item.page}`); }}
                        className={`flex items-center p-3 transition-all duration-200 relative ${currentPage === item.page
                                ? 'text-violet-600 font-bold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        style={currentPage === item.page
                            ? { background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '14px', boxShadow: '0 4px 12px rgba(139,92,246,0.04)' }
                            : { borderRadius: '14px' }
                        }
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

            <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'rgba(139,92,246,0.06)' }}>
                <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 ring-2 ring-violet-500/30 flex-shrink-0">
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
