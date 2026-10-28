import api from '../../api/axios';

export const pegawaiAktivitasKerjaService = {
    async create(pegawaiId, formData) {
        const response = await api.post(`/pegawai/${pegawaiId}/aktivitas-kerja`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async update(pegawaiId, id, formData) {
        formData.append('_method', 'PUT');
        const response = await api.post(`/pegawai/${pegawaiId}/aktivitas-kerja/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    async delete(pegawaiId, id) {
        const response = await api.delete(`/pegawai/${pegawaiId}/aktivitas-kerja/${id}`);
        return response.data;
    }
};