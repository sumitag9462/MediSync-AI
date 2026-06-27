import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ocrApi } from '../api/ocrApi';
import { useToast } from '../context/ToastContext';
import { Loader2, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

const OCRHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await ocrApi.getHistory();
                setHistory(response.data || []);
            } catch (error) {
                addToast('Error', 'Failed to load OCR history', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [addToast]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Approved</span>;
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold w-fit">{status}</span>;
        }
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/20"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Prescription Scan History</h1>
                    <p className="text-gray-600">View your previously scanned and extracted prescriptions.</p>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No History Found</h3>
                        <p className="text-gray-500">You haven't scanned any prescriptions yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <motion.div 
                                key={item._id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="h-40 bg-gray-100 relative">
                                    <img 
                                        src={`${baseUrl}/uploads/${item.imageUrl}`} 
                                        alt="Prescription Thumbnail" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Image+Unavailable' }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <Calendar size={14} />
                                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(item.createdAt))}
                                    </div>
                                    <h4 className="font-medium text-gray-800 mb-2">
                                        Extracted Medicines ({item.extractedData.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {item.extractedData.slice(0, 3).map((med, idx) => (
                                            <span key={idx} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-lg truncate max-w-[120px]">
                                                {med.name}
                                            </span>
                                        ))}
                                        {item.extractedData.length > 3 && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                                                +{item.extractedData.length - 3} more
                                            </span>
                                        )}
                                        {item.extractedData.length === 0 && (
                                            <span className="text-sm text-gray-400">None extracted</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 flex justify-between items-center pt-3 border-t border-gray-100">
                                        <span>AI Confidence</span>
                                        <span className={`font-semibold ${item.confidenceScore >= 0.8 ? 'text-green-600' : item.confidenceScore >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {Math.round(item.confidenceScore * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OCRHistoryPage;
