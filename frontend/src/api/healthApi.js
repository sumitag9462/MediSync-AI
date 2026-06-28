import apiClient from './apiClient';

export const healthApi = {
    logSymptom: async (data) => {
        const response = await apiClient.post('/health/symptoms', data);
        return response.data;
    },
    getSymptoms: async () => {
        const response = await apiClient.get('/health/symptoms');
        return response.data;
    },
    getInsights: async () => {
        const response = await apiClient.get('/health/insights');
        return response.data;
    },
    triggerAnalysis: async () => {
        const response = await apiClient.post('/health/insights/analyze');
        return response.data;
    },
    getPredictions: async () => {
        const response = await apiClient.get('/health/predictions');
        return response.data;
    }
};
