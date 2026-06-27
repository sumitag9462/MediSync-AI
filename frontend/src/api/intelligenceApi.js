import apiClient from './apiClient';

export const intelligenceApi = {
    getSafetyDashboard: async () => {
        const response = await apiClient.get('/intelligence/safety-dashboard');
        return response.data;
    },
    getMedicationProfile: async (rxCui) => {
        const response = await apiClient.get(`/intelligence/profile/${rxCui}`);
        return response.data;
    }
};
