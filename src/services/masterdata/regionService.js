import api from '../../api/axios';

export const regionService = {
    async getProvinsi(params) {
        const response = await api.get('/master/provinsi', { params });
        return response.data;
    },
    async getKota(params) {
        const response = await api.get('/master/kota', { params });
        return response.data;
    },
    async getKecamatan(params) {
        const response = await api.get('/master/kecamatan', { params });
        return response.data;
    },
    async getKelurahan(params) {
        const response = await api.get('/master/kelurahan', { params });
        return response.data;
    }
};