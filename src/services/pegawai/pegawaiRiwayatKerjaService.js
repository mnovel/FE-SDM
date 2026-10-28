import api from '../../api/axios';

export const pegawaiRiwayatKerjaService = {
    async create(pegawaiId, formData) {
        const response = await api.post(`/pegawai/${pegawaiId}/riwayat-kerja`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async update(pegawaiId, id, formData) {
        formData.append('_method', 'PUT');
        const response = await api.post(`/pegawai/${pegawaiId}/riwayat-kerja/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/riwayat-kerja/${id}`);
        return response.data;
    }
};