/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    React.useEffect(() => {
        const handleGlobalToast = (e) => {
            if (e.detail && e.detail.message) {
                addToast(e.detail.message, e.detail.type || 'info');
            }
        };
        window.addEventListener('toast', handleGlobalToast);
        return () => window.removeEventListener('toast', handleGlobalToast);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, showToast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto w-80 bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex items-start gap-3"
                        >
                            <div className="mt-0.5">
                                {toast.type === 'success' && <CheckCircle className="text-emerald-500" size={18} />}
                                {toast.type === 'error' && <XCircle className="text-red-500" size={18} />}
                                {toast.type === 'warning' && <AlertTriangle className="text-amber-500" size={18} />}
                                {toast.type === 'info' && <Info className="text-blue-500" size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{toast.message}</p>
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
