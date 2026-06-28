import apiClient from './apiClient';

export const journalApi = {
    logJournal: async (data) => {
        const response = await apiClient.post('/journal', data);
        return response.data;
    },
    getJournals: async () => {
        const response = await apiClient.get('/journal');
        return response.data;
    }
};
