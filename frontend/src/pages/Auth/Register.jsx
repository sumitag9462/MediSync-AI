import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, MapPin, Phone, Lock, BrainCircuit, ShieldCheck, Chrome, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AuthLayout from './AuthLayout';
import { FloatingInput, MagneticButton, OtpInput, OAuthButton } from './AuthComponents';
import { useToast } from '../../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { authApi } from '../../api/authApi';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        email: '', mobile: '', place: '', password: '',
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const googleLoginFlow = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            const result = await authApi.googleLogin(tokenResponse.credential || tokenResponse.access_token);
            setIsLoading(false);
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify({ name: result.name, email: result.email, _id: result._id, photo: result.photo }));
                window.location.href = '/dashboard';
            } else {
                showToast(result.message || 'Google Login Failed', 'error');
            }
        },
        onError: () => {
            showToast('Google login failed or was cancelled', 'error');
        }
    });

    const handleAppleLogin = async () => {
        try {
            const response = await AppleSignin.signIn({
                authOptions: {
                    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || "placeholder-client-id",
                    scope: 'email name',
                    redirectURI: window.location.origin,
                    state: 'state',
                    nonce: 'nonce',
                    usePopup: true
                }
            });
            setIsLoading(true);
            const result = await authApi.appleLogin(response.authorization.id_token, response.user ? JSON.stringify(response.user) : null);
            setIsLoading(false);
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify({ name: result.name, email: result.email, _id: result._id, photo: result.photo }));
                window.location.href = '/dashboard';
            } else {
                showToast(result.message || 'Apple Login Failed', 'error');
            }
        } catch (error) {
            console.log(error);
            showToast('Apple login failed or was cancelled', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await apiClient.post('/auth/request-email-otp', { email: formData.email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            setError('Please enter a complete 6-digit code.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
        
        try {
            const res = await apiClient.post('/auth/verify-email-otp', {
                name: fullName,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile,
                place: formData.place,
                otp: otp,
            });

            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout 
          title="Create Account" 
          subtitle={step === 1 ? "Start your path to better health today." : "We've sent a code to verify your identity."}
          page="/login" 
          linkText="Sign In"
          illustration={
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {step === 1 ? (
                <UserPlus size={160} className="text-white/20 animate-pulse" />
              ) : (
                <ShieldCheck size={160} className="text-white/20 animate-pulse" />
              )}
              <div className="absolute w-full h-full border border-white/10 rounded-full animate-[spin_15s_linear_infinite]" />
              <div className="absolute w-[120%] h-[120%] border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            </div>
          }
        >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-10 relative max-w-xs mx-auto w-full z-10 auth-stagger">
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                <div className="absolute top-4 left-0 h-0.5 bg-purple-500 transition-all duration-500 -z-10" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                
                {[
                    { num: 1, label: 'Personal Info' },
                    { num: 2, label: 'Verify Email' },
                    { num: 3, label: 'Complete' }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.num ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            {s.num}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.num ? 'text-purple-700' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleRequestOtp} 
                        className="space-y-4"
                    >
                        <div className="flex gap-4 auth-stagger">
                            <FloatingInput 
                                label="First Name" name="firstName" value={formData.firstName} 
                                onChange={handleInputChange} required 
                            />
                            <FloatingInput 
                                label="Last Name" name="lastName" value={formData.lastName} 
                                onChange={handleInputChange} required 
                            />
                        </div>
                        <div className="auth-stagger">
                            <FloatingInput 
                                label="Middle Name (Optional)" name="middleName" value={formData.middleName} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="auth-stagger">
                            <FloatingInput 
                                label="Email Address" type="email" name="email" value={formData.email} 
                                onChange={handleInputChange} icon={Mail} required 
                            />
                        </div>
                        <div className="flex gap-4 auth-stagger">
                            <div className="w-1/2">
                                <FloatingInput 
                                    label="Mobile" type="tel" name="mobile" value={formData.mobile} 
                                    onChange={handleInputChange} icon={Phone} required 
                                />
                            </div>
                            <div className="w-1/2">
                                <FloatingInput 
                                    label="Location" name="place" value={formData.place} 
                                    onChange={handleInputChange} icon={MapPin} required 
                                />
                            </div>
                        </div>
                        <div className="auth-stagger">
                            <FloatingInput 
                                label="Password" type="password" name="password" value={formData.password} 
                                onChange={handleInputChange} required minLength="8" title="At least 8 characters"
                            />
                        </div>
                        
                        {error && <div className="auth-stagger p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

                        <div className="auth-stagger pt-2">
                            <MagneticButton type="submit" isLoading={isLoading}>
                                Send Verification Code
                            </MagneticButton>
                        </div>
                        
                        <div className="auth-stagger flex items-center justify-between w-full my-6">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>
                        
                        <div className="auth-stagger space-y-3">
                            <OAuthButton provider="Google" icon={Chrome} onClick={() => googleLoginFlow()} />
                            <OAuthButton provider="Apple" icon={Apple} onClick={handleAppleLogin} />
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
                        onSubmit={handleVerifyAndRegister} 
                        className="space-y-6"
                    >
                        <p className="text-slate-600 text-sm text-center auth-stagger">
                            Enter the 6-digit verification code sent to <br/>
                            <span className="font-extrabold text-slate-800 text-base">{formData.email}</span>
                        </p>
                        
                        <div className="auth-stagger py-4">
                            <OtpInput length={6} value={otp} onChange={setOtp} />
                        </div>

                        {message && <div className="auth-stagger p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-xs text-center">{message}</div>}
                        {error && <div className="auth-stagger p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs text-center">{error}</div>}

                        <div className="auth-stagger">
                            <MagneticButton type="submit" isLoading={isLoading}>
                                Verify & Create Account
                            </MagneticButton>
                        </div>
                        
                        <div className="auth-stagger flex justify-center mt-4">
                            <button type="button" onClick={() => setStep(1)} disabled={isLoading} className="text-sm text-slate-500 hover:text-slate-850 transition-colors">
                                Edit details
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default RegisterPage;