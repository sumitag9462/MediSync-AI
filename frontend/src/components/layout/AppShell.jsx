import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx'; // Corrected import path
import Topbar from './Topbar.jsx';   // Corrected import path

// The navigate prop is no longer needed here as Sidebar will handle its own navigation
const AppShell = ({ user, onLogout, currentPage, children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20 w-full relative">
            <Sidebar user={user} currentPage={currentPage} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden relative z-10" style={{ marginLeft: isSidebarOpen ? 240 : 80, transition: 'margin-left 0.3s ease' }}>
                <Topbar user={user} onLogout={onLogout} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full relative"
                    >
                        <div className="max-w-[1400px] mx-auto w-full h-full relative">{children}</div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AppShell;

