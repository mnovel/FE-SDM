import api from '../../api/axios';

export const masterUnitService = {
    async getAll(params) {
        const response = await api.get('/master/unit', { params });
        return response.data;
    },
    async create(data) {
        const response = await api.post('/master/unit', data);
        return response.data;
    },
    async update(id, data) {
        const response = await api.put(`/master/unit/${id}`, data);
        return response.data;
    },
    async delete(id) {
        const response = await api.delete(`/master/unit/${id}`);
        return response.data;
    }
};