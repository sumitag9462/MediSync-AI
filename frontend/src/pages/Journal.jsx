import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Save, Loader, Activity, Heart, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { journalApi } from '../api/journalApi';
import { dateUtils } from '../utils/dateUtils';

const JournalPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [savedJournals, setSavedJournals] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    
    const recognitionRef = useRef(null);

    useEffect(() => {
        fetchJournals();
        
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };
            
            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await journalApi.getJournals();
            setSavedJournals(res.data || []);
        } catch (error) {
            console.error("Failed to fetch journals:", error);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setTranscript(''); // Clear previous when starting new
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleSave = async () => {
        if (!transcript.trim()) return;
        setIsSaving(true);
        try {
            await journalApi.logJournal({ transcription: transcript });
            setTranscript('');
            await fetchJournals();
        } catch (error) {
            console.error("Failed to save journal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const getMoodColor = (mood) => {
        const m = (mood || '').toLowerCase();
        if (m.includes('happy') || m.includes('good') || m.includes('great')) return 'bg-emerald-100 text-emerald-700';
        if (m.includes('sad') || m.includes('bad') || m.includes('pain')) return 'bg-rose-100 text-rose-700';
        if (m.includes('anxious') || m.includes('tired')) return 'bg-amber-100 text-amber-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8" style={{ paddingLeft: '90px' }}>
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Voice Journal</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Record how you&apos;re feeling today. AI will extract insights automatically.</p>
                    </div>
                </div>

                {/* Recording Section */}
                <GlassCard hover={false} className="relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleRecording}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors ${isRecording ? 'bg-rose-500 hover:bg-rose-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {isRecording ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
                        </motion.button>
                        
                        <p className="mt-6 text-slate-600 font-medium">
                            {isRecording ? "Listening... Speak now." : "Tap the microphone to start recording"}
                        </p>

                        {transcript && (
                            <div className="mt-8 w-full max-w-2xl text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Current Transcript</h3>
                                <p className="text-slate-700 leading-relaxed min-h-[60px]">{transcript}</p>
                                
                                {!isRecording && (
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                                        >
                                            {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                            {isSaving ? 'Analyzing & Saving...' : 'Save Journal'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* History Section */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" /> Recent Entries
                    </h2>
                    
                    <div className="grid gap-4">
                        {savedJournals.length === 0 ? (
                            <p className="text-slate-500 text-sm">No journal entries yet.</p>
                        ) : (
                            savedJournals.map(journal => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={journal._id} 
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {dateUtils.formatDate(journal.createdAt)} at {new Date(journal.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getMoodColor(journal.mood)}`}>
                                            {journal.mood}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed mb-4">{journal.transcription}</p>
                                    
                                    {journal.tags && journal.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {journal.tags.map((tag, i) => (
                                                <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
                                                    <Activity size={12} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JournalPage;
