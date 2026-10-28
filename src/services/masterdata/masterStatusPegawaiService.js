import api from '../../api/axios';

export const masterStatusPegawaiService = {
    async getAll(params) {
        const response = await api.get('/master/status-pegawai', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/master/status-pegawai', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/master/status-pegawai/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/master/status-pegawai/${id}`);
        return response.data;
    }
};