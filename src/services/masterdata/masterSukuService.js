import api from '../../api/axios';

export const masterSukuService = {
    async getAll(params) {
        const response = await api.get('/master/suku', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/suku', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/suku/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/suku/${id}`);
        return response.data;
    }
};