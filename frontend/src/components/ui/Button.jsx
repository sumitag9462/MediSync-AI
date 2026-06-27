import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    disabled = false,
    className = '',
    type = 'button',
    loading = false
}) => {
    const baseClasses = "relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden";
    
    const sizeClasses = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    const variantClasses = {
        primary: "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-[0_8px_20px_-6px_rgba(147,51,234,0.5)] focus:ring-purple-500 border border-transparent",
        secondary: "bg-white text-slate-800 border border-slate-200 hover:border-purple-300 hover:text-purple-600 hover:bg-slate-50 focus:ring-slate-200 shadow-sm",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 focus:ring-red-500",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200"
    };

    const widthClass = fullWidth ? "w-full" : "";
    const disabledClass = (disabled || loading) ? "opacity-60 cursor-not-allowed transform-none hover:shadow-none" : "hover:-translate-y-0.5 active:translate-y-0";

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
        >
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : null}
            <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
        </motion.button>
    );
};
