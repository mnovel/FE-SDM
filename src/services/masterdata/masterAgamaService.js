import api from '../../api/axios';

export const masterAgamaService = {
    async getAll(params) {
        const response = await api.get('/master/agama', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/agama', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/agama/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/agama/${id}`);
        return response.data;
    }
};