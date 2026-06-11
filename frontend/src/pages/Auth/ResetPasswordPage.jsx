import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import apiClient from '../../api/apiClient';
import AuthLayout from './AuthLayout';
import { FloatingInput, MagneticButton } from './AuthComponents';

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length > 7) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(Math.min(5, score));
  }, [password]);

  const getColor = () => {
    if (strength === 0) return 'bg-gray-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (password.length === 0) return 'Enter a password';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-2 flex flex-col gap-1 w-full">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-colors duration-500 ${level <= strength ? getColor() : 'bg-white/10'}`} 
          />
        ))}
      </div>
      <div className="flex justify-end mt-1">
        <span className={`text-xs font-bold ${password.length === 0 ? 'text-gray-500' : 'text-gray-300'}`}>
           {getLabel()}
        </span>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        setIsLoading(true);

        try {
            const res = await apiClient.post('/auth/reset-password', { token, password });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
            setIsLoading(false);
        }
    };
    
    return (
        <AuthLayout 
          title="Set New Password" 
          subtitle="Create a strong password to secure your account."
          illustration={
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <KeyRound size={160} className="text-white/20 animate-pulse" />
              <div className="absolute w-[110%] h-[110%] border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute w-[130%] h-[130%] border border-green-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          }
        >
            <form onSubmit={handleResetPassword} className="space-y-6">
                
                <div className="auth-stagger">
                    <FloatingInput 
                        label="New Password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength="8"
                    />
                    <PasswordStrengthMeter password={password} />
                </div>
                
                <div className="auth-stagger">
                    <FloatingInput 
                        label="Confirm New Password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        minLength="8"
                    />
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                        <p className="text-red-400 text-xs font-bold mt-2 text-right">Passwords do not match</p>
                    )}
                </div>
                
                {message && <div className="auth-stagger p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-green-400 text-sm font-bold"><ShieldCheck size={18} /> {message}</div>}
                {error && <div className="auth-stagger p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400 text-sm font-bold"><ShieldAlert size={18} /> {error}</div>}

                <div className="auth-stagger pt-4">
                    <MagneticButton type="submit" isLoading={isLoading} disabled={password !== confirmPassword || password.length < 8}>
                        Reset Password
                    </MagneticButton>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;