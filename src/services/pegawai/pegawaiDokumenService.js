import api from '../../api/axios';

export const pegawaiDokumenService = {
    async getAll(pegawaiId) {
        const response = await api.get(`/pegawai/${pegawaiId}/dokumen`);
        return response.data;
    },
    async create(pegawaiId, formData) {
        const response = await api.post(`/pegawai/${pegawaiId}/dokumen`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async update(pegawaiId, id, formData) {
        formData.append('_method', 'PUT');
        const response = await api.post(`/pegawai/${pegawaiId}/dokumen/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/dokumen/${id}`);
        return response.data;
    }
};