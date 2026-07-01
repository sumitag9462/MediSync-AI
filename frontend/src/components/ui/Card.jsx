import React from 'react';
// import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false }) => {
    const hoverClasses = hover ? "hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all hover:-translate-y-1" : "";
    return (
        <div className={`bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${className}`}>
            <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-slate-500 font-medium mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};
