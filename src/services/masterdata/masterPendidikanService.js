import api from '../../api/axios';

export const masterPendidikanService = {
    async getAll(params) {
        const response = await api.get('/master/pendidikan', { params });
        return response.data;
    },
    async create(data) {
        const response = await api.post('/master/pendidikan', data);
        return response.data;
    },
    async update(id, data) {
        const response = await api.put(`/master/pendidikan/${id}`, data);
        return response.data;
    },
    async delete(id) {
        const response = await api.delete(`/master/pendidikan/${id}`);
        return response.data;
    }
};