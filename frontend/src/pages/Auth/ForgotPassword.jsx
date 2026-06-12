import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, UnlockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AuthLayout from './AuthLayout';
import { FloatingInput, MagneticButton, OtpInput } from './AuthComponents';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await apiClient.post('/auth/request-password-reset-otp', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            setError('Please enter a complete 6-digit code.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const res = await apiClient.post('/auth/verify-password-reset-otp', { email, otp });
            if (res.data.success) {
                navigate(`/reset-password/${res.data.resetToken}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout 
          title={step === 1 ? "Forgot Password" : "Verify Identity"} 
          subtitle={step === 1 ? "Enter your email to receive a recovery code." : "We've sent a code to your email."} 
          page="/login" 
          linkText="Back to Login"
          illustration={
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {step === 1 ? (
                 <KeyRound size={160} className="text-white/20 animate-pulse" />
              ) : (
                 <UnlockKeyhole size={160} className="text-white/20 animate-pulse" />
              )}
              <div className="absolute w-[110%] h-[110%] border border-white/10 rounded-full animate-[spin_12s_linear_infinite]" />
              <div className="absolute w-[130%] h-[130%] border border-pink-500/10 rounded-full animate-[spin_18s_linear_infinite_reverse]" />
            </div>
          }
        >
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleRequestOtp} 
                        className="space-y-6"
                    >
                        <div className="auth-stagger">
                            <FloatingInput 
                                label="Registered Email" type="email" value={email} 
                                onChange={(e) => setEmail(e.target.value)} icon={Mail} required 
                            />
                        </div>

                        {error && <div className="auth-stagger p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">{error}</div>}
                        {message && <div className="auth-stagger p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center">{message}</div>}

                        <div className="auth-stagger pt-2">
                            <MagneticButton type="submit" isLoading={isLoading}>
                                Send Recovery Code
                            </MagneticButton>
                        </div>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleVerifyOtp} 
                        className="space-y-6"
                    >
                        <p className="text-slate-600 text-sm text-center auth-stagger">
                            Enter the 6-digit recovery code sent to <br/>
                            <span className="font-extrabold text-slate-800 text-base">{email}</span>
                        </p>
                        
                        <div className="auth-stagger py-4">
                            <OtpInput length={6} value={otp} onChange={setOtp} />
                        </div>

                        {error && <div className="auth-stagger p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs text-center">{error}</div>}

                        <div className="auth-stagger">
                            <MagneticButton type="submit" isLoading={isLoading}>
                                Verify Code
                            </MagneticButton>
                        </div>

                        <div className="auth-stagger flex justify-center mt-4">
                            <button type="button" onClick={() => setStep(1)} disabled={isLoading} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                                Change Email
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;