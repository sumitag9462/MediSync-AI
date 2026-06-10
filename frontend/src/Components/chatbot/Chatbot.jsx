import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, MessageSquare, Send } from 'lucide-react';
import apiClient from "../../api/apiClient";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Hello! I am your MedWell assistant. How can I help you with your schedules?' }] }
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
                if(event.error === "no-speech"){
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
                if(transcript.trim() !== ''){
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
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
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
                const systemPrompt = `You are MedWell, a helpful AI assistant. User Data: ${JSON.stringify(userData)}`;
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
        <div className="fixed bottom-6 right-6 z-50 group">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg"
            >
                <AnimatePresence>
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </AnimatePresence>
            </motion.button>
            {!isOpen && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    AI Assistant
                </div>
            )}
        </div>

        <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-24 right-6 w-96 h-[32rem] panel-glass shadow-2xl flex flex-col z-40 overflow-hidden"
            >
                <div className="p-4 bg-gray-900 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Wellness Assistant</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700 flex items-center space-x-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask something..."
                        className="flex-1 bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows="1"
                    />
                    <button
                        onClick={handleVoiceClick}
                        className={`bg-purple-600 p-2 rounded-full text-white ${isListening ? 'animate-pulse' : ''}`}
                    >
                        <Mic size={18} />
                    </button>
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading}
                        className="ml-1 bg-purple-600 p-2 rounded-full text-white disabled:bg-purple-800 disabled:cursor-not-allowed"
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
