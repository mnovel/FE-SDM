import api from '../../api/axios';

export const pegawaiKeluargaService = {
    async getAll(pegawaiId) {
        const response = await api.get(`/pegawai/${pegawaiId}/keluarga`);
        return response.data;
    },
    async create(pegawaiId, data) {
        const response = await api.post(`/pegawai/${pegawaiId}/keluarga`, data);
        return response.data;
    },
    async update(pegawaiId, id, data) {
        const response = await api.put(`/pegawai/${pegawaiId}/keluarga/${id}`, data);
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/keluarga/${id}`);
        return response.data;
    }
};