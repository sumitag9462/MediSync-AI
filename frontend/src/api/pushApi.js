import apiClient from './apiClient';

export const pushApi = {
    getVapidPublicKey: async () => {
        const response = await apiClient.get('/push/vapidPublicKey');
        return response.data;
    },
    subscribe: async (subscription) => {
        const response = await apiClient.post('/push/subscribe', subscription);
        return response.data;
    },
    unsubscribe: async (endpoint) => {
        const response = await apiClient.post('/push/unsubscribe', { endpoint });
        return response.data;
    }
};
