import api from '../../api/axios';

export const masterLiburService = {
    async getAll(params) {
        const response = await api.get('/master/libur', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/libur', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/libur/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/libur/${id}`);
        return response.data;
    }
};