import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/authApi.js';
import { googleCalendarApi } from '../services/googleCalendarApi.js';
import { notificationService } from '../services/notificationService.js';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user } = useAuth();
    const [isCalendarEnabled, setIsCalendarEnabled] = useState(googleCalendarApi.isCalendarEnabled());
    const [notificationPermission, setNotificationPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const isEnabled = googleCalendarApi.isCalendarEnabled();
            if (isEnabled !== isCalendarEnabled) {
                setIsCalendarEnabled(isEnabled);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isCalendarEnabled]);

    const handleCalendarSignIn = () => {
        googleCalendarApi.handleAuthClick().then(() => setIsCalendarEnabled(true))
        .catch(err => {
            console.error("Calendar sign-in error", err);
            const errMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
            alert(`Google Calendar Error: ${errMsg}\n\n(If you see popup_closed, ensure your browser allows popups and third-party cookies for accounts.google.com)`);
        });
    };

    const handleCalendarSignOut = () => {
        googleCalendarApi.handleSignoutClick();
        setIsCalendarEnabled(false);
    };

    const setReminderPermission = async () => {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20 w-full">
            {/* Animated Background System - Light Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>

            <div className="flex-1 flex flex-col space-y-8 w-full max-w-4xl mx-auto z-10 relative px-4 md:px-8 py-12 pb-24">
                <div className="mb-2 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Account <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Settings</span></h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage your profile, preferences, and integrations.</p>
                </div>
                
                <div className="flex flex-col gap-8">
                    {/* Profile Card Section */}
                    <div className="rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 self-start tracking-tight">Your Profile</h2>
                        <ProfileCard />
                    </div>

                    {/* Integrations Section */}
                    <div className="rounded-[2.5rem] p-8 md:p-10 flex flex-col bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Integrations & Notifications</h2>
                        <div className="space-y-6 w-full">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Google Calendar Sync</h3>
                                    <p className="text-sm text-slate-500 font-medium">Automatically sync your medication schedules.</p>
                                </div>
                                {isCalendarEnabled ? (
                                    <button onClick={handleCalendarSignOut} className="text-sm font-bold py-2.5 px-6 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100 shadow-sm shrink-0">
                                        Disconnect
                                    </button>
                                ) : (
                                    <button onClick={handleCalendarSignIn} className="text-sm font-bold py-2.5 px-6 rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm shrink-0">
                                        Connect Calendar
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Browser Notifications</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Status: <span className={`font-extrabold uppercase tracking-wider text-xs px-2 py-1 rounded-md ml-1 ${notificationPermission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{notificationPermission}</span>
                                    </p>
                                </div>
                                {notificationPermission !== 'granted' && (
                                    <button onClick={setReminderPermission} className="text-sm font-bold py-2.5 px-6 rounded-xl text-slate-700 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm shrink-0">
                                        Request Permission
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;


// Inline ProfileCard component with working Remove Photo
const ProfileCard = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: '',
        place: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: { 
            remindersEnabled: true, 
            reminderLeadMinutes: 10,
            snoozeMinutes: 5,
            sound: true,
            vibration: false,
            location: null,
        },
        photo: user?.photo || '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user?.photo || '');

    useEffect(() => {
        let mounted = true;
        authApi.getProfile().then(profile => {
            if (!mounted) return;
            setForm(prev => ({
                ...prev,
                name: profile.name || prev.name,
                email: profile.email || prev.email,
                mobile: profile.mobile || '',
                place: profile.place || '',
                timezone: profile.timezone || prev.timezone,
                notifications: profile.notifications || prev.notifications,
                photo: profile.photo || '',
                location: profile.notifications?.location || null,
            }));
            setPhotoPreview(profile.photo || '');
            updateUser(profile);
            setLoading(false);

            if (profile.notifications?.remindersEnabled) {
                authApi.getSchedules().then(schedules => {
                    schedules.forEach(schedule => notificationService.setReminder(schedule, profile.notifications));
                }).catch(err => console.error('Failed to fetch schedules:', err));
            }
        }).catch(err => {
            console.error('Failed to load profile', err);
            setLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedPhotoFile(file);
        setMessage('');
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    // ✅ New: Remove Photo Handler
    const handleRemovePhoto = async () => {
        try {
            setUploading(true);
            await authApi.updateProfile({ photo: null });
            setPhotoPreview('');
            setForm(prev => ({ ...prev, photo: '' }));
            updateUser({ ...(user || {}), photo: '' });
            setMessage('Profile photo removed');
        } catch (err) {
            console.error('Failed to remove photo', err);
            setMessage('Failed to remove photo');
        } finally {
            setUploading(false);
        }
    };

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('notifications.')) {
            const key = name.split('.')[1];
            let val = type === 'checkbox' ? checked : value;
            if (['reminderLeadMinutes','snoozeMinutes'].includes(key)) val = Number(val);
            if (key === 'location') {
                val = value ? value.split(',').map(v => Number(v.trim())) : null;
            }
            setForm(prev => ({
                ...prev,
                notifications: { ...prev.notifications, [key]: val }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                name: form.name,
                mobile: form.mobile,
                place: form.place,
                timezone: form.timezone,
                notifications: form.notifications,
            };
            const updated = await authApi.updateProfile(payload);

            if (form.notifications.remindersEnabled) {
                authApi.getSchedules().then(schedules => {
                    schedules.forEach(schedule => notificationService.setReminder(schedule, form.notifications));
                }).catch(err => console.error('Failed to fetch schedules for reminders:', err));
            }

            if (selectedPhotoFile) {
                setUploading(true);
                try {
                    const { photo } = await authApi.uploadProfilePhoto(selectedPhotoFile);
                    setForm(prev => ({ ...prev, photo }));
                    setPhotoPreview(photo || '');
                    updateUser({ ...(user || {}), ...updated, photo });
                } catch (err) {
                    setMessage(err?.response?.data?.message || 'Failed to upload photo');
                    setUploading(false);
                    setSaving(false);
                    return;
                } finally {
                    setUploading(false);
                    setSelectedPhotoFile(null);
                }
            } else {
                updateUser({ ...(user || {}), ...updated });
            }
            setMessage('Profile updated successfully');
        } catch (err) {
            console.error('Failed to update profile', err);
            setMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center font-bold text-sm text-slate-400">Loading profile...</div>;

    return (
        <form className="w-full flex flex-col items-center gap-6" onSubmit={e => { e.preventDefault(); saveProfile(); }}>
            <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex items-center justify-center bg-slate-50">
                    {photoPreview ? (
                        <img src={photoPreview} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Placeholder" className="w-full h-full object-cover rounded-full opacity-60" />
                    )}
                </div>
                <div className="flex gap-3">
                    <input id="avatarInput" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploading} />
                    <label htmlFor="avatarInput" className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-md hover:-translate-y-0.5 ${uploading ? 'bg-slate-200 text-slate-500' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm'}`}>
                        {uploading ? 'Uploading…' : 'Change Photo'}
                    </label>

                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploading || !photoPreview}
                        className="bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">Name</label>
                    <input name="name" value={form.name} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-inner" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">Email <span className="lowercase font-medium">(read-only)</span></label>
                    <input name="email" value={form.email} disabled className="w-full rounded-xl p-3 text-sm font-bold text-slate-500 bg-slate-100 border border-slate-200 opacity-70" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">Mobile</label>
                    <input name="mobile" value={form.mobile} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-inner" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">Place</label>
                    <input name="place" value={form.place} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-inner" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">Timezone</label>
                    <input name="timezone" value={form.timezone} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-inner" />
                </div>

                {/* Reminder Section */}
                <div className="md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                    <label className="block text-sm font-extrabold tracking-tight mb-4 text-slate-900">Reminders Configuration</label>
                    <div className="flex flex-col gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                            <input type="checkbox" name="notifications.remindersEnabled" checked={!!form.notifications?.remindersEnabled} onChange={onChange} className="w-5 h-5 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 shadow-sm" />
                            <span className="text-base font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Enable reminders</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            <div>
                                <span className="block text-xs font-bold mb-1.5 text-slate-500">Lead time (minutes)</span>
                                <input type="number" min="0" name="notifications.reminderLeadMinutes" value={form.notifications?.reminderLeadMinutes} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-sm" />
                            </div>

                            <div>
                                <span className="block text-xs font-bold mb-1.5 text-slate-500">Snooze (minutes)</span>
                                <input type="number" min="0" name="notifications.snoozeMinutes" value={form.notifications?.snoozeMinutes} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-sm" />
                            </div>

                            <div>
                                <span className="block text-xs font-bold mb-1.5 text-slate-500">Location (lat,lng)</span>
                                <input type="text" name="notifications.location" placeholder="28.5,77.2" value={form.notifications.location?.join(',') || ''} onChange={onChange} className="w-full rounded-xl p-3 text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-sm" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8 mt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="notifications.sound" checked={!!form.notifications?.sound} onChange={onChange} className="w-5 h-5 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 shadow-sm" />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Sound Alert</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="notifications.vibration" checked={!!form.notifications?.vibration} onChange={onChange} className="w-5 h-5 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 shadow-sm" />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Vibration</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                {message && <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">{message}</span>}
                <button type="submit" disabled={saving} className="ml-auto text-base font-bold py-3.5 px-8 rounded-xl text-white transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-purple-600 to-pink-500 shadow-md">
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};
