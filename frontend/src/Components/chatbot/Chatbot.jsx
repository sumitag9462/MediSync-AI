import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, MessageSquare, Send } from 'lucide-react';
import apiClient from "../../api/apiClient";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Hello! I am your MediSync-AI assistant. How can I help you with your schedules?' }] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Pre-warm Web Speech API voices cache
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // Toggle chatbot event listener
    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-chatbot', handleToggle);
        return () => window.removeEventListener('toggle-chatbot', handleToggle);
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;       // Keep listening
            recognitionRef.current.interimResults = true;   // Detect partial speech
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                console.log("Mic started listening...");
                setIsListening(true);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("SpeechRecognition error:", event.error);
                if (event.error === "no-speech") {
                    // restart recognition after short delay
                    recognitionRef.current.stop();
                    setTimeout(() => recognitionRef.current.start(), 300);
                }
            };

            recognitionRef.current.onend = () => {
                console.log("Mic stopped listening");
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                if (transcript.trim() !== '') {
                    console.log("Heard:", transcript);
                    setInput(transcript);
                    handleSend(transcript); // auto-send after voice input
                }
            };
        }
    }, []);

    const handleVoiceClick = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel any active speech to prevent queuing overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();

        // Premium natural voice selection
        const preferredVoice =
            voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Alex') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Daniel') && v.lang.startsWith('en')) ||
            voices.find(v => v.lang.startsWith('en-US')) ||
            voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Adjust parameters to make it sound warm, clear, and less robotic
        utterance.rate = 0.95;  // Slightly slower speed for better pacing
        utterance.pitch = 1.05; // Slightly higher pitch for a friendly, natural tone

        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (voiceInput) => {
        const currentInput = voiceInput ?? input;
        if (!currentInput.trim() || isLoading) return;

        const userMessage = { role: 'user', parts: [{ text: currentInput }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const contextResponse = await apiClient.get('/chatbot/context');
            const userData = contextResponse.data;

            let aiReply = '';

            if (/today/i.test(currentInput)) {
                const res = await apiClient.get('/ai/todays-schedule');
                const todaysMeds = res.data;
                if (todaysMeds.length) {
                    aiReply = `Here is your schedule for today:\n${todaysMeds.map(m => `• ${m.name} (${m.dosage}) at ${m.times.join(', ')}`).join('\n')}`;
                } else {
                    aiReply = "You have no scheduled medications for today.";
                }
            } else if (/likely to miss|missed/i.test(currentInput)) {
                const res = await apiClient.get('/ai/missed-risk');
                const riskData = res.data;
                aiReply = `Your missed dose risk is: ${riskData.risk}. You missed ${riskData.missedNightCount} doses recently at night.`;
            } else {
                const systemPrompt = `You are MediSync-AI, a helpful AI assistant. User Data: ${JSON.stringify(userData)}`;
                const res = await apiClient.post('/chatbot/message', {
                    history: messages,
                    input: currentInput,
                    systemPrompt,
                });
                aiReply = res.data.reply;
            }

            const modelMessage = { role: 'model', parts: [{ text: aiReply }] };
            setMessages(prev => [...prev, modelMessage]);

            // Speak the AI response
            speakText(aiReply);

        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Something went wrong. Try again." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] z-50 focus:outline-none"
            >
                {isOpen ? <X size={24} /> : '💬'}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-[22rem] sm:w-96 h-[32rem] bg-white/80 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-2xl rounded-[2.5rem] flex flex-col z-40 overflow-hidden"
                    >
                        <div className="p-5 bg-white/50 border-b border-slate-100 backdrop-blur-md">
                            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"></div>
                                Wellness Assistant
                            </h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-sm'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                                        }`}>
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white/50 border-t border-slate-100 backdrop-blur-md flex items-center space-x-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask something..."
                                className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none shadow-inner placeholder-slate-400 text-sm font-medium custom-scrollbar"
                                rows="1"
                            />
                            <button
                                onClick={handleVoiceClick}
                                className={`p-2.5 rounded-full text-white shadow-sm transition-transform hover:scale-105 shrink-0 ${isListening ? 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`}
                            >
                                <Mic size={18} />
                            </button>
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading}
                                className="p-2.5 rounded-full text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-500 shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
