import React from 'react';

export const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    disabled = false,
    className = '',
    required = false,
    icon: Icon = null
}) => {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    {label} {required && <span className="text-pink-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full rounded-xl p-3.5 text-sm font-semibold text-slate-900 bg-white border 
                        transition-all shadow-sm outline-none
                        ${Icon ? 'pl-10' : ''}
                        ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 hover:border-purple-200'}
                        ${disabled ? 'opacity-60 bg-slate-50 cursor-not-allowed' : ''}
                    `}
                />
            </div>
            {error && (
                <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">{error}</span>
            )}
        </div>
    );
};
