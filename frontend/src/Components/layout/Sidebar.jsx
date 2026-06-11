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
            className="flex flex-col h-full relative bg-[#0c0c1e] border-r border-white/5"
        >
            <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
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
                            <span className="text-xl font-bold ml-2 text-white">MediSync-AI</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-3">
                {navItems.map(item => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate(`/${item.page}`); }}
                        className={`flex items-center p-3 transition-all duration-200 relative ${
                            currentPage === item.page
                                ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/10 text-violet-300 border border-violet-500/30 rounded-xl'
                                : 'text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl'
                        }`}
                        style={currentPage === item.page ? { boxShadow: '0 0 12px rgba(139,92,246,0.15)' } : {}}
                        title={item.name}
                    >
                        {currentPage === item.page && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute top-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                            />
                        )}
                        {item.icon}
                        <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="ml-4 font-medium whitespace-nowrap"
                            >
                                {item.name}
                            </motion.span>
                        )}
                        </AnimatePresence>
                    </a>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 ring-2 ring-violet-500/50 ring-offset-2 ring-offset-[#0c0c1e] flex-shrink-0">
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
                        <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                        <span className="text-xs text-white/40">Patient</span>
                    </motion.div>
                )}
            </div>

            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="absolute -right-4 top-16 bg-[#0c0c1e] border border-white/10 text-white p-2 rounded-full shadow-lg shadow-violet-900/20 focus:outline-none"
            >
                {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </motion.div>
    );
};

export default Sidebar;
