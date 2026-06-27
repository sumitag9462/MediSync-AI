import apiClient from './apiClient';

export const adherenceService = {
    getYearlyAdherence: async () => {
        const response = await apiClient.get('/adherence/yearly');
        return response.data;
    }
};
