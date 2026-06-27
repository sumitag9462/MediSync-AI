import React, { useState, useRef } from 'react';
import { Upload, Camera, FileImage, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ocrApi } from '../api/ocrApi';

const OCRUploadPage = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            addToast('Error', 'Please upload a valid image file (JPG, PNG, WEBP)', 'error');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            addToast('Error', 'File size exceeds 10MB limit', 'error');
            return;
        }
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const handleRemove = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        // Simulate progress for UI feedback
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append('prescription', file);

            const result = await ocrApi.uploadImage(formData);
            
            clearInterval(interval);
            setUploadProgress(100);

            addToast('Success', 'Prescription analyzed successfully!', 'success');
            
            // Wait a moment for progress bar to finish visually
            setTimeout(() => {
                // Navigate to review page with data
                navigate('/ocr-review', { state: { extractionData: result.data } });
            }, 500);

        } catch (error) {
            clearInterval(interval);
            setUploadProgress(0);
            setIsUploading(false);
            addToast('Error', error.message || 'Failed to analyze prescription', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Prescription Scanner</h1>
                    <p className="text-gray-600">Upload your prescription and let AI create your medication schedule automatically.</p>
                </div>

                {!file ? (
                    <div 
                        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                            dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleChange}
                        />
                        
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="bg-teal-100 p-4 rounded-full mb-4 text-teal-600">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Drag & Drop your image here</h3>
                            <p className="text-gray-500 mb-6">or</p>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-teal-500/30 flex items-center gap-2"
                                >
                                    <FileImage size={20} />
                                    Browse Files
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-6">Supported formats: JPG, PNG, WEBP (Max 10MB)</p>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden relative shadow-inner">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="w-full md:w-2/3 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</h4>
                                        <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    {!isUploading && (
                                        <button 
                                            onClick={handleRemove}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {isUploading ? (
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-teal-600 font-medium flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Analyzing with Gemini Vision...
                                            </span>
                                            <span className="text-gray-500">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-auto flex justify-end">
                                        <button 
                                            onClick={handleUpload}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-teal-500/30 flex items-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            Analyze Prescription
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
                
                <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 text-blue-800 items-start">
                    <AlertCircle size={24} className="shrink-0 mt-0.5" />
                    <p className="text-sm">
                        <strong>Privacy Note:</strong> Your prescriptions are processed securely. We use Google's advanced Gemini AI to extract medication details, but you will always have the final say to review and edit the data before it is saved to your account.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default OCRUploadPage;
