import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileQuestion, title = "No data found", description = "We couldn't find anything here right now.", children }) => {
    return (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                <Icon size={32} />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-1">{title}</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
            {children}
        </div>
    );
};

export default EmptyState;
