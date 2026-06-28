import React, { useState, useEffect } from 'react';
import { Users, Mail, Link as LinkIcon, Shield, Activity, Plus } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { workspaceApi } from '../api/workspaceApi';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const CollaborationPage = () => {
    const { user } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaces.length === 0) return;
        
        const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000');
        
        workspaces.forEach(ws => {
            // Join workspace room
            socket.emit('join_workspace_room', ws._id);
        });

        socket.on('dose_logged', (data) => {
            // Find patient name
            const ws = workspaces.find(w => w.patient._id === data.patientId);
            if (ws) {
                const message = `${ws.patient.name} just logged a dose: ${data.log.medicationName} (${data.log.status})`;
                setRealtimeUpdates(prev => [message, ...prev].slice(0, 5));
                
                // Show browser notification if possible
                if (Notification.permission === 'granted') {
                    new Notification("MediSync-AI: Caregiver Alert", { body: message });
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [workspaces]);

    const fetchWorkspaces = async () => {
        try {
            const res = await workspaceApi.getWorkspaces();
            setWorkspaces(res.data || []);
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteError('');
        setInviteSuccess('');
        
        try {
            await workspaceApi.inviteCaregiver(inviteEmail);
            setInviteSuccess(`Successfully invited ${inviteEmail}!`);
            setInviteEmail('');
            fetchWorkspaces();
        } catch (error) {
            setInviteError(error.response?.data?.message || 'Failed to invite caregiver.');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8" style={{ paddingLeft: '90px' }}>
            <div className="max-w-5xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Caregiver Dashboard</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Manage who can monitor your health, or monitor the health of your loved ones.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - My Workspace & Invites */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard hover={false}>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Shield size={22} className="text-purple-600" /> Invite a Caregiver
                                </h2>
                                
                                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Caregiver Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={16} className="text-slate-400" />
                                            </div>
                                            <input 
                                                type="email" 
                                                required
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all" 
                                                placeholder="doctor@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end pb-[1px]">
                                        <button 
                                            type="submit" 
                                            disabled={isInviting}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-bold transition-colors disabled:opacity-70 shadow-md shadow-purple-500/20"
                                        >
                                            {isInviting ? 'Inviting...' : <><Plus size={18} /> Invite</>}
                                        </button>
                                    </div>
                                </form>
                                {inviteError && <p className="mt-3 text-sm text-red-500 font-medium">{inviteError}</p>}
                                {inviteSuccess && <p className="mt-3 text-sm text-emerald-500 font-medium">{inviteSuccess}</p>}
                            </div>
                        </GlassCard>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Users size={22} className="text-slate-400" /> Linked Accounts
                            </h2>
                            
                            {workspaces.length === 0 ? (
                                <p className="text-slate-500 text-sm">You are not linked to any workspaces yet.</p>
                            ) : (
                                workspaces.map(ws => (
                                    <div key={ws._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                                                {ws.patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{ws.patient.name} {ws.patient._id === user._id ? '(Me)' : ''}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {ws.patient._id === user._id ? 'My Workspace' : 'Patient you are monitoring'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Members</p>
                                            <div className="flex -space-x-2">
                                                {ws.members.map(m => (
                                                    <div key={m.user._id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600" title={`${m.user.name} (${m.role})`}>
                                                        {m.user.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {ws.members.length === 0 && <span className="text-sm text-slate-400">No members</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column - Real-time Feed */}
                    <div className="lg:col-span-1">
                        <GlassCard hover={false} className="h-full">
                            <div className="p-6 h-full flex flex-col">
                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Activity size={20} className="text-pink-500" /> Live Feed
                                </h2>
                                
                                <div className="flex-1 space-y-4">
                                    {realtimeUpdates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                <Activity size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">Listening for real-time adherence updates via Socket.io...</p>
                                        </div>
                                    ) : (
                                        realtimeUpdates.map((update, i) => (
                                            <div key={i} className="p-3 bg-purple-50 border border-purple-100 rounded-xl animate-fade-in-down">
                                                <p className="text-sm text-purple-900 font-medium">{update}</p>
                                                <p className="text-xs text-purple-400 mt-1">Just now</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CollaborationPage;
