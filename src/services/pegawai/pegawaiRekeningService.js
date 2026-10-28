import api from '../../api/axios';

export const pegawaiRekeningService = {
    async getAll(pegawaiId) {
        const response = await api.get(`/pegawai/${pegawaiId}/rekening`);
        return response.data;
    },
    async create(pegawaiId, data) {
        const response = await api.post(`/pegawai/${pegawaiId}/rekening`, data);
        return response.data;
    },
    async update(pegawaiId, id, data) {
        const response = await api.put(`/pegawai/${pegawaiId}/rekening/${id}`, data);
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/rekening/${id}`);
        return response.data;
    }
};