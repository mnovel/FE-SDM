import api from '../../api/axios';

export const pegawaiService = {
    async getAll(params) {
        const response = await api.get('/pegawai', { params });
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/pegawai/${id}`);
        return response.data;
    },

    async getProfil(id) {
        const response = await api.get(`/pegawai/${id}/profil`);
        return response.data;
    },

    async create(formData) {
        const response = await api.post('/pegawai', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async update(id, formData) {
        formData.append('_method', 'PUT');
        const response = await api.post(`/pegawai/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/pegawai/${id}`);
        return response.data;
    }
};