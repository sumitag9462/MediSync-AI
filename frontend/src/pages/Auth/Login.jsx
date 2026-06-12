import React, { useState } from 'react';
import { Mail, BrainCircuit, Chrome, Apple } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AuthLayout from './AuthLayout';
import { FloatingInput, MagneticButton, OAuthButton } from './AuthComponents';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { authApi } from '../../api/authApi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (result?.success) {
            navigate('/dashboard');
        } else {
            showToast(result?.message || 'Invalid email or password. Please try again.', 'error');
        }
    };

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
    
    return (
       <AuthLayout 
          title="Welcome Back" 
          subtitle="Log in to manage your wellness journey with AI." 
          page="/register" 
          linkText="Create Account"
          illustration={
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <BrainCircuit size={160} className="text-white/20 animate-pulse" />
              <div className="absolute w-full h-full border border-white/10 rounded-full animate-[spin_15s_linear_infinite]" />
              <div className="absolute w-[120%] h-[120%] border border-purple-500/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
            </div>
          }
       >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="auth-stagger p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
                
                <div className="auth-stagger">
                    <FloatingInput 
                        label="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        icon={Mail}
                        required 
                    />
                </div>
                
                <div className="auth-stagger">
                    <FloatingInput 
                        label="Password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <div className="auth-stagger flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded bg-black/40 border border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 transition-all cursor-pointer" />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                    </label>
                    <a href="#" onClick={e => {e.preventDefault(); navigate('/forgot-password')}} className="text-sm text-purple-400 hover:text-pink-400 font-bold transition-colors">Forgot Password?</a>
                </div>
                
                <div className="auth-stagger pt-2">
                    <MagneticButton type="submit" isLoading={isLoading}>
                        Access Dashboard
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
            </form>
        </AuthLayout>
    );
};

export default LoginPage;