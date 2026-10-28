import api from '../../api/axios';

export const masterBahasaService = {
    async getAll(params) {
        const response = await api.get('/master/bahasa', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/bahasa', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/bahasa/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/bahasa/${id}`);
        return response.data;
    }
};