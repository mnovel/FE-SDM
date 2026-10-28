import api from '../../api/axios';

export const masterPangkatService = {
    async getAll(params) {
        const response = await api.get('/master/pangkat', { params });
        return response.data;
    },
    async create(data) {
        const response = await api.post('/master/pangkat', data);
        return response.data;
    },
    async update(id, data) {
        const response = await api.put(`/master/pangkat/${id}`, data);
        return response.data;
    },
    async delete(id) {
        const response = await api.delete(`/master/pangkat/${id}`);
        return response.data;
    }
};