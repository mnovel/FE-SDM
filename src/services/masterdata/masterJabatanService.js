import api from '../../api/axios';

export const masterJabatanService = {
    async getAll(params) {
        const response = await api.get('/master/jabatan', { params });
        return response.data;
    },
    async getById(id) {
        const response = await api.get(`/master/jabatan/${id}`);
        return response.data;
    },
    async create(data) {
        const response = await api.post('/master/jabatan', data);
        return response.data;
    },
    async update(id, data) {
        const response = await api.put(`/master/jabatan/${id}`, data);
        return response.data;
    },
    async delete(id) {
        const response = await api.delete(`/master/jabatan/${id}`);
        return response.data;
    }
};