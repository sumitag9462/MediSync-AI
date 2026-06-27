import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const ocrApi = {
    /**
     * Upload a prescription image for OCR extraction.
     */
    uploadImage: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/ocr/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Save the reviewed and confirmed medication schedule.
     */
    saveSchedule: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/ocr/save`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Fetch user's OCR history.
     */
    getHistory: async () => {
        try {
            const response = await axios.get(`${API_URL}/ocr/history`, getAuthHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
