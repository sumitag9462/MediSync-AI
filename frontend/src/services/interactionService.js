import apiClient from '../api/apiClient';

export const interactionService = {
    /**
     * Check a new medicine against existing active medications.
     * @param {string} medicineName
     */
    checkNewMedicine: async (medicineName) => {
        const response = await apiClient.post('/interactions/check', { newMedicine: medicineName });
        return response.data;
    },

    /**
     * Run a full safety check across all active medications.
     */
    checkFullList: async () => {
        const response = await apiClient.get('/interactions/full-check');
        return response.data;
    }
};
