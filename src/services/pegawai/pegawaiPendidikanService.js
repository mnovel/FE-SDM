import api from '../../api/axios';

export const pegawaiPendidikanService = {
    async getAll(pegawaiId) {
        const response = await api.get(`/pegawai/${pegawaiId}/pendidikan`);
        return response.data;
    },
    async create(pegawaiId, formData) {
        const response = await api.post(`/pegawai/${pegawaiId}/pendidikan`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async update(pegawaiId, id, formData) {
        formData.append('_method', 'PUT');
        const response = await api.post(`/pegawai/${pegawaiId}/pendidikan/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/pendidikan/${id}`);
        return response.data;
    }
};