import React, { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';

export const FloatingInput = ({ label, type = "text", value, onChange, name, placeholder, required, icon: Icon, minLength, title, readOnly }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full group">
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        title={title}
        readOnly={readOnly}
        autoComplete="new-password"
        className={`w-full bg-white/60 border border-slate-200 rounded-xl px-4 pt-6 pb-2 text-slate-900 placeholder-transparent focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all peer shadow-sm backdrop-blur-sm ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
        placeholder={placeholder || label}
      />
      <label className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-purple-600 peer-valid:top-1.5 peer-valid:text-[11px] pointer-events-none uppercase tracking-wide font-bold">
        {label}
      </label>
      
      {Icon && !isPassword && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-600 transition-colors pointer-events-none">
          <Icon size={18} />
        </div>
      )}

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export const MagneticButton = ({ children, type = "button", onClick, disabled, isLoading, className = "" }) => {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if(!btnRef.current || disabled || isLoading) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btnRef.current, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if(!btnRef.current) return;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_10px_20px_rgba(168,85,247,0.2)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${className}`}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative flex items-center justify-center gap-2 drop-shadow-md">
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : children}
      </span>
    </button>
  );
};

export const OtpInput = ({ length = 6, value, onChange }) => {
  const [otpArray, setOtpArray] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if(value === "") setOtpArray(new Array(length).fill(""));
  }, [value]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    
    const newArray = [...otpArray];
    newArray[index] = val.substring(val.length - 1);
    setOtpArray(newArray);
    onChange(newArray.join(""));

    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).replace(/\D/g, "");
    if(!pastedData) return;
    const newArray = [...otpArray];
    for(let i=0; i<pastedData.length; i++) {
        newArray[i] = pastedData[i];
    }
    setOtpArray(newArray);
    onChange(newArray.join(""));
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div className="flex gap-2 justify-between w-full">
      {otpArray.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold bg-white/60 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:shadow-[0_10px_20px_rgba(168,85,247,0.15)] transition-all transform focus:-translate-y-1 shadow-sm"
        />
      ))}
    </div>
  );
};
