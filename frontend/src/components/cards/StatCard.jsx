import React from 'react';

const StatCard = ({ title, value, icon }) => (
    <div className="relative overflow-hidden p-6 rounded-[2rem] bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all group flex items-center space-x-5">
        <div className={`p-4 rounded-2xl bg-purple-50 text-purple-600 shadow-inner group-hover:scale-110 transition-transform`}>{icon}</div>
        <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">{title}</p>
            <p className="text-slate-900 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
    </div>
);

export default StatCard;
