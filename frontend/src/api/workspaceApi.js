import apiClient from './apiClient';

export const workspaceApi = {
    getWorkspaces: async () => {
        const response = await apiClient.get('/workspaces');
        return response.data;
    },
    inviteCaregiver: async (email, role = 'caregiver') => {
        const response = await apiClient.post('/workspaces/invite', { email, role });
        return response.data;
    }
};
