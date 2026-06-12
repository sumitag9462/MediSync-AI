import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { googleCalendarApi } from './services/googleCalendarApi';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import DashboardPage from './pages/Dashboard';
import SchedulesPage from './pages/Schedules';
import HistoryPage from './pages/History';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import NearbyClinic from './pages/NearbyClinic';
import BuyCoffee from './pages/BuyCoffee'; 
import MedicineSecretPage from './pages/MedicineSecretPage'; // 🆕 Secret Medicine Page

// Import Layout
import AppShell from './components/layout/AppShell';
import Chatbot from './components/chatbot/Chatbot';
import AuroraBackground from './components/ui/AuroraBackground';

// ✅ Private Route Wrapper
const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ✅ App Layout for Authenticated Users
const AppLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = location.pathname.substring(1);

    useEffect(() => {
        googleCalendarApi.loadGapiScripts();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <AppShell user={user} onLogout={handleLogout} currentPage={currentPage}>
            <Chatbot />
            <Outlet />
        </AppShell>
    );
};

// ✅ Main App
function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id"}>
            <AuthProvider>
                <ToastProvider>
                <BrowserRouter>
                    <AuroraBackground>
                        <div className="font-sans">
                            <Routes>
                                {/* 🌍 Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                                <Route path="/buy-coffee" element={<BuyCoffee />} /> 

                                {/* 🔐 Private Routes Layout */}
                                <Route element={<PrivateRoute />}>
                                    <Route element={<AppLayout />}>
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/schedules" element={<SchedulesPage />} />
                                        <Route path="/history" element={<HistoryPage />} />
                                        <Route path="/analytics" element={<AnalyticsPage />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/nearbyclinic" element={<NearbyClinic />} />

                                        {/* 🆕 Secret Medicine Info Route */}
                                        <Route path="/medicine-secret" element={<MedicineSecretPage />} />

                                        {/* Redirect unknown routes to dashboard */}
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Route>
                                </Route>
                            </Routes>
                        </div>
                    </AuroraBackground>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
