import api from '../../api/axios';

export const masterStatusPernikahanService = {
    async getAll(params) {
        const response = await api.get('/master/status-pernikahan', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/status-pernikahan', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/status-pernikahan/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/status-pernikahan/${id}`);
        return response.data;
    }
};