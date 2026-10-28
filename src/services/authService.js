import api from '../api/axios';

export const authService = {
    async login(username, password) {
        const { data } = await api.post('/auth/login', { username, password });
        return data.data; // { access_token, token_type, expires_in, user }
    },

    async me() {
        const { data } = await api.get('/auth/me');
        return data.data;
    },

    async logout() {
        await api.post('/auth/logout');
    },

    async refresh() {
        const { data } = await api.post('/auth/refresh');
        return data.data;
    },
};