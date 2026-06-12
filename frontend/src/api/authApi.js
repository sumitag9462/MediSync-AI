import apiClient from './apiClient';

export const authApi = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            return response.data; 
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Invalid credentials" };
        }
    },

    googleLogin: async (token) => {
        try {
            const response = await apiClient.post('/auth/google', { token });
            return response.data;
        } catch (error) {
            console.error("Google login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Google Login failed" };
        }
    },

    appleLogin: async (identityToken, user) => {
        try {
            const response = await apiClient.post('/auth/apple', { identityToken, user });
            return response.data;
        } catch (error) {
            console.error("Apple login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Apple Login failed" };
        }
    },

    register: async (name, email, password) => {
        try {
            // Make a REAL API call to the backend register route
            const response = await apiClient.post('/auth/register', { name, email, password });
            // The backend returns { success: true, user }
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.put('/auth/me', data);
        return response.data;
    },

    uploadProfilePhoto: async (file) => {
        const formData = new FormData();
        // Backend expects field name 'photo'
        formData.append('photo', file);
        const response = await apiClient.post('/auth/me/photo', formData);
        // Returns { photo, user }
        return response.data;
    },

    // ✅ New function added to fetch user’s medication schedules
    getSchedules: async () => {
        try {
            // This calls your backend endpoint `/schedules`
            const response = await apiClient.get('/schedules');
            return response.data; // Expecting an array of schedules
        } catch (error) {
            console.error("Failed to fetch schedules:", error.response?.data || error.message);
            return [];
        }
    },
};
