import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm w-full h-full overflow-hidden relative">
                        <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'list':
                return (
                    <div className="w-full h-20 bg-slate-50 border border-slate-100 rounded-xl animate-pulse p-4 flex items-center gap-4">
                         <div className="rounded-full bg-slate-200 h-12 w-12 shrink-0"></div>
                         <div className="flex-1 space-y-3">
                             <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                             <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                         </div>
                    </div>
                );
            case 'chart':
                return (
                    <div className="w-full h-64 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse p-6 flex flex-col justify-end gap-2">
                        <div className="flex justify-between items-end h-full gap-4">
                            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
                                <div key={i} className="bg-slate-200 rounded-t-md w-full" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl"></div>;
        }
    };

    return (
        <div className={`grid gap-4 ${type === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                    {renderSkeleton()}
                </motion.div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
