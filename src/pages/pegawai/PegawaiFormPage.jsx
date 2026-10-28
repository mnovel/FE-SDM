import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { pegawaiService } from '../../services/pegawai/pegawaiService';
import { masterAgamaService } from '../../services/masterdata/masterAgamaService';
import { masterPendidikanService } from '../../services/masterdata/masterPendidikanService';
import { masterStatusPernikahanService } from '../../services/masterdata/masterStatusPernikahanService';
import { regionService } from '../../services/masterdata/regionService';
import Toast from '../../components/ui/Toast';
import PageHeader from '../../components/ui/PageHeader';

// HELPER: Caching API ke localStorage agar tidak fetch ulang terus-menerus
const fetchWithCache = async (cacheKey, fetchFn) => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const res = await fetchFn();
    if (res && res.success) {
        localStorage.setItem(cacheKey, JSON.stringify(res));
    }
    return res;
};

export default function PegawaiFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    // Master Data
    const [options, setOptions] = useState({ agamas: [], pendidikans: [], statusPernikahans: [] });

    // Wilayah KTP
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Wilayah Domisili
    const [domisiliCities, setDomisiliCities] = useState([]);
    const [domisiliDistricts, setDomisiliDistricts] = useState([]);
    const [domisiliVillages, setDomisiliVillages] = useState([]);

    const [formData, setFormData] = useState({
        nip: '', nama: '', gelar_depan: '', gelar_belakang: '',
        jenis_identitas: 'KTP', no_identitas: '',
        jenis_kelamin: 'Laki-Laki', tempat_lahir: '', tanggal_lahir: '',
        email: '', no_hp: '', no_hp_darurat: '',
        agama_id: '', pendidikan_id: '', status_pernikahan_id: '',
        alamat: '', kode_pos: '',
        provinsi_id: '', kota_id: '', kecamatan_id: '', kelurahan_id: '',
        alamat_domisili: '', kode_pos_domisili: '',
        provinsi_domisili_id: '', kota_domisili_id: '', kecamatan_domisili_id: '', kelurahan_domisili_id: '',
    });

    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const showToast = (message, type = 'error') => setToast({ message, type });

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch Master Data dengan CACHE (Jauh lebih cepat di load kedua)
                const requests = [
                    fetchWithCache('master_agama', () => masterAgamaService.getAll({ per_page: 100 })),
                    fetchWithCache('master_pendidikan', () => masterPendidikanService.getAll({ per_page: 100 })),
                    fetchWithCache('master_status_nikah', () => masterStatusPernikahanService.getAll({ per_page: 100 })),
                    fetchWithCache('master_provinsi', () => regionService.getProvinsi({ per_page: 100 })),
                ];

                if (isEditMode) requests.push(pegawaiService.getById(id));

                const [agamaRes, pendidikanRes, statusRes, provRes, pegawaiRes] = await Promise.all(requests);

                setOptions({
                    agamas: agamaRes?.data || [],
                    pendidikans: pendidikanRes?.data || [],
                    statusPernikahans: statusRes?.data || [],
                });
                setProvinces(provRes?.data || []);

                if (isEditMode && pegawaiRes?.success) {
                    const p = pegawaiRes.data;
                    const tglLahir = p.tanggal_lahir ? p.tanggal_lahir.split('T')[0] : '';

                    setFormData({
                        nip: p.nip || '', nama: p.nama || '',
                        gelar_depan: p.gelar_depan || '', gelar_belakang: p.gelar_belakang || '',
                        jenis_identitas: p.jenis_identitas || 'KTP', no_identitas: p.no_identitas || '',
                        jenis_kelamin: p.jenis_kelamin || 'Laki-Laki',
                        tempat_lahir: p.tempat_lahir || '', tanggal_lahir: tglLahir,
                        email: p.email || '', no_hp: p.no_hp || '', no_hp_darurat: p.no_hp_darurat || '',
                        agama_id: p.master_agama_id || '', pendidikan_id: p.master_pendidikan_id || '',
                        status_pernikahan_id: p.master_status_pernikahan_id || '',
                        alamat: p.alamat || '', kode_pos: p.kode_pos || '',
                        provinsi_id: p.master_provinsi_id || '', kota_id: p.master_kota_id || '',
                        kecamatan_id: p.master_kecamatan_id || '', kelurahan_id: p.master_kelurahan_id || '',
                        alamat_domisili: p.alamat_domisili || '', kode_pos_domisili: p.kode_pos_domisili || '',
                        provinsi_domisili_id: p.master_provinsi_domisili_id || '',
                        kota_domisili_id: p.master_kota_domisili_id || '',
                        kecamatan_domisili_id: p.master_kecamatan_domisili_id || '',
                        kelurahan_domisili_id: p.master_kelurahan_domisili_id || '',
                    });

                    if (p.foto) setFotoPreview(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${p.foto}`);

                    // DEDUPLIKASI: Cek apakah KTP dan Domisili punya kode wilayah yang sama
                    const isProvSame = p.provinsi?.code && p.provinsi?.code === p.provinsi_domisili?.code;
                    const isKotaSame = p.kota?.code && p.kota?.code === p.kota_domisili?.code;
                    const isKecSame = p.kecamatan?.code && p.kecamatan?.code === p.kecamatan_domisili?.code;

                    const regionRequests = [];
                    const reqKeys = [];

                    // KTP
                    if (p.provinsi?.code) { reqKeys.push('cities'); regionRequests.push(fetchWithCache(`cities_${p.provinsi.code}`, () => regionService.getKota({ province_code: p.provinsi.code, per_page: 100 }))); }
                    if (p.kota?.code) { reqKeys.push('districts'); regionRequests.push(fetchWithCache(`districts_${p.kota.code}`, () => regionService.getKecamatan({ city_code: p.kota.code, per_page: 100 }))); }
                    if (p.kecamatan?.code) { reqKeys.push('villages'); regionRequests.push(fetchWithCache(`villages_${p.kecamatan.code}`, () => regionService.getKelurahan({ district_code: p.kecamatan.code, per_page: 100 }))); }

                    // Domisili (Hanya fetch jika beda dengan KTP)
                    if (p.provinsi_domisili?.code && !isProvSame) { reqKeys.push('domCities'); regionRequests.push(fetchWithCache(`cities_${p.provinsi_domisili.code}`, () => regionService.getKota({ province_code: p.provinsi_domisili.code, per_page: 100 }))); }
                    if (p.kota_domisili?.code && !isKotaSame) { reqKeys.push('domDistricts'); regionRequests.push(fetchWithCache(`districts_${p.kota_domisili.code}`, () => regionService.getKecamatan({ city_code: p.kota_domisili.code, per_page: 100 }))); }
                    if (p.kecamatan_domisili?.code && !isKecSame) { reqKeys.push('domVillages'); regionRequests.push(fetchWithCache(`villages_${p.kecamatan_domisili.code}`, () => regionService.getKelurahan({ district_code: p.kecamatan_domisili.code, per_page: 100 }))); }

                    const regionResults = await Promise.all(regionRequests);
                    
                    let ktpCities = [], ktpDistricts = [], ktpVillages = [];

                    regionResults.forEach((res, index) => {
                        if (res.success) {
                            const key = reqKeys[index];
                            if (key === 'cities') { setCities(res.data); ktpCities = res.data; }
                            if (key === 'districts') { setDistricts(res.data); ktpDistricts = res.data; }
                            if (key === 'villages') { setVillages(res.data); ktpVillages = res.data; }
                            if (key === 'domCities') setDomisiliCities(res.data);
                            if (key === 'domDistricts') setDomisiliDistricts(res.data);
                            if (key === 'domVillages') setDomisiliVillages(res.data);
                        }
                    });

                    // Jika Domisili sama dengan KTP, salin datanya agar tidak fetch ulang
                    if (isProvSame) setDomisiliCities(ktpCities);
                    if (isKotaSame) setDomisiliDistricts(ktpDistricts);
                    if (isKecSame) setDomisiliVillages(ktpVillages);
                }
            } catch (error) {
                console.error("Gagal load data awal:", error);
                showToast('Gagal memuat data referensi.', 'error');
            } finally {
                setFetching(false);
            }
        };

        initData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    // --- HANDLER WILAYAH KTP ---
    const handleProvinsiChange = async (e) => {
        const provId = e.target.value;
        setFormData(prev => ({ ...prev, provinsi_id: provId, kota_id: '', kecamatan_id: '', kelurahan_id: '' }));
        if (!provId) { setCities([]); setDistricts([]); setVillages([]); return; }
        
        const prov = provinces.find(p => p.id === Number(provId));
        if (prov) {
            const res = await fetchWithCache(`cities_${prov.code}`, () => regionService.getKota({ province_code: prov.code, per_page: 100 }));
            if (res.success) setCities(res.data);
        }
    };

    const handleKotaChange = async (e) => {
        const kotaId = e.target.value;
        setFormData(prev => ({ ...prev, kota_id: kotaId, kecamatan_id: '', kelurahan_id: '' }));
        if (!kotaId) { setDistricts([]); setVillages([]); return; }

        const kota = cities.find(k => k.id === Number(kotaId));
        if (kota) {
            const res = await fetchWithCache(`districts_${kota.code}`, () => regionService.getKecamatan({ city_code: kota.code, per_page: 100 }));
            if (res.success) setDistricts(res.data);
        }
    };

    const handleKecamatanChange = async (e) => {
        const kecId = e.target.value;
        setFormData(prev => ({ ...prev, kecamatan_id: kecId, kelurahan_id: '' }));
        if (!kecId) { setVillages([]); return; }

        const kec = districts.find(k => k.id === Number(kecId));
        if (kec) {
            const res = await fetchWithCache(`villages_${kec.code}`, () => regionService.getKelurahan({ district_code: kec.code, per_page: 100 }));
            if (res.success) setVillages(res.data);
        }
    };

    // --- HANDLER WILAYAH DOMISILI ---
    const handleProvinsiDomisiliChange = async (e) => {
        const provId = e.target.value;
        setFormData(prev => ({ ...prev, provinsi_domisili_id: provId, kota_domisili_id: '', kecamatan_domisili_id: '', kelurahan_domisili_id: '' }));
        if (!provId) { setDomisiliCities([]); setDomisiliDistricts([]); setDomisiliVillages([]); return; }

        const prov = provinces.find(p => p.id === Number(provId));
        if (prov) {
            const res = await fetchWithCache(`cities_${prov.code}`, () => regionService.getKota({ province_code: prov.code, per_page: 100 }));
            if (res.success) setDomisiliCities(res.data);
        }
    };

    const handleKotaDomisiliChange = async (e) => {
        const kotaId = e.target.value;
        setFormData(prev => ({ ...prev, kota_domisili_id: kotaId, kecamatan_domisili_id: '', kelurahan_domisili_id: '' }));
        if (!kotaId) { setDomisiliDistricts([]); setDomisiliVillages([]); return; }

        const kota = domisiliCities.find(k => k.id === Number(kotaId));
        if (kota) {
            const res = await fetchWithCache(`districts_${kota.code}`, () => regionService.getKecamatan({ city_code: kota.code, per_page: 100 }));
            if (res.success) setDomisiliDistricts(res.data);
        }
    };

    const handleKecamatanDomisiliChange = async (e) => {
        const kecId = e.target.value;
        setFormData(prev => ({ ...prev, kecamatan_domisili_id: kecId, kelurahan_domisili_id: '' }));
        if (!kecId) { setDomisiliVillages([]); return; }

        const kec = domisiliDistricts.find(k => k.id === Number(kecId));
        if (kec) {
            const res = await fetchWithCache(`villages_${kec.code}`, () => regionService.getKelurahan({ district_code: kec.code, per_page: 100 }));
            if (res.success) setDomisiliVillages(res.data);
        }
    };

    // OPTIMASI: Salin KTP ke Domisili TANPA API CALL
    const copyKtpToDomisili = () => {
        setFormData(prev => ({
            ...prev,
            alamat_domisili: prev.alamat,
            kode_pos_domisili: prev.kode_pos,
            provinsi_domisili_id: prev.provinsi_id,
            kota_domisili_id: prev.kota_id,
            kecamatan_domisili_id: prev.kecamatan_id,
            kelurahan_domisili_id: prev.kelurahan_id,
        }));

        // Cukup salin state dropdown yang sudah ada di memori (0 ms)
        setDomisiliCities(cities);
        setDomisiliDistricts(districts);
        setDomisiliVillages(villages);

        showToast('Alamat KTP berhasil disalin ke Domisili', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        if (foto) data.append('foto', foto);

        try {
            if (isEditMode) {
                await pegawaiService.update(id, data);
                showToast('Data pegawai berhasil diperbarui!', 'success');
            } else {
                await pegawaiService.create(data);
                showToast('Data pegawai berhasil ditambahkan!', 'success');
            }
            setTimeout(() => navigate('/pegawai'), 1000);
        } catch (error) {
            if (error.response?.status === 422) {
                const errData = error.response.data;
                if (errData.error && errData.error.details) setErrors(errData.error.details);
                else if (errData.errors) setErrors(errData.errors);
                else showToast(errData.message || 'Validasi gagal.', 'error');
            } else {
                showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-12 text-center text-slate-500">Memuat data form...</div>;

    return (
        <div className="relative w-full pb-20">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <PageHeader title={isEditMode ? 'Edit Data Pegawai' : 'Tambah Data Pegawai'} description="Lengkapi formulir di bawah." />
                <Link to="/pegawai" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2 mb-6 sm:mb-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Kembali
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION 1: DATA DIRI */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">1. Data Diri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">NIP</label>
                            <input type="text" name="nip" value={formData.nip} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" placeholder="NIP (Opsional)" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gelar Depan</label>
                                <input type="text" name="gelar_depan" value={formData.gelar_depan} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" placeholder="dr." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gelar Belakang</label>
                                <input type="text" name="gelar_belakang" value={formData.gelar_belakang} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" placeholder="Sp.PD" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Identitas</label>
                            <select name="jenis_identitas" value={formData.jenis_identitas} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm">
                                <option value="KTP">KTP</option>
                                <option value="SIM">SIM</option>
                                <option value="Paspor">Paspor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">No. Identitas</label>
                            <input type="text" name="no_identitas" value={formData.no_identitas} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Kelamin <span className="text-red-500">*</span></label>
                            <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required>
                                <option value="Laki-Laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tempat Lahir <span className="text-red-500">*</span></label>
                            <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
                            <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agama <span className="text-red-500">*</span></label>
                            <select name="agama_id" value={formData.agama_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required>
                                <option value="">-- Pilih Agama --</option>
                                {options.agamas.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                            <select name="pendidikan_id" value={formData.pendidikan_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required>
                                <option value="">-- Pilih Pendidikan --</option>
                                {options.pendidikans.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Pernikahan <span className="text-red-500">*</span></label>
                            <select name="status_pernikahan_id" value={formData.status_pernikahan_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" required>
                                <option value="">-- Pilih Status --</option>
                                {options.statusPernikahans.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6 pt-2">
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {fotoPreview ? <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto Profil</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: KONTAK */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">2. Kontak</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor HP</label>
                            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">No. HP Darurat</label>
                            <input type="text" name="no_hp_darurat" value={formData.no_hp_darurat} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ALAMAT KTP */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">3. Alamat Sesuai KTP</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap (Jalan/Dusun)</label>
                            <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kode Pos</label>
                            <input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                        </div>

                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Provinsi</label>
                                <select name="provinsi_id" value={formData.provinsi_id} onChange={handleProvinsiChange} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none">
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kota/Kabupaten</label>
                                <select name="kota_id" value={formData.kota_id} onChange={handleKotaChange} disabled={!formData.provinsi_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kota --</option>
                                    {cities.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kecamatan</label>
                                <select name="kecamatan_id" value={formData.kecamatan_id} onChange={handleKecamatanChange} disabled={!formData.kota_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelurahan/Desa</label>
                                <select name="kelurahan_id" value={formData.kelurahan_id} onChange={handleChange} disabled={!formData.kecamatan_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kelurahan --</option>
                                    {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: ALAMAT DOMISILI */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-800">4. Alamat Domisili</h3>
                        <button type="button" onClick={copyKtpToDomisili} className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                            Salin dari KTP
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap (Jalan/Dusun)</label>
                            <input type="text" name="alamat_domisili" value={formData.alamat_domisili} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" placeholder="Kosongkan jika sama dengan KTP" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kode Pos</label>
                            <input type="text" name="kode_pos_domisili" value={formData.kode_pos_domisili} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" placeholder="Kode Pos" />
                        </div>

                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Provinsi</label>
                                <select name="provinsi_domisili_id" value={formData.provinsi_domisili_id} onChange={handleProvinsiDomisiliChange} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none">
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kota/Kabupaten</label>
                                <select name="kota_domisili_id" value={formData.kota_domisili_id} onChange={handleKotaDomisiliChange} disabled={!formData.provinsi_domisili_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kota --</option>
                                    {domisiliCities.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kecamatan</label>
                                <select name="kecamatan_domisili_id" value={formData.kecamatan_domisili_id} onChange={handleKecamatanDomisiliChange} disabled={!formData.kota_domisili_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {domisiliDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelurahan/Desa</label>
                                <select name="kelurahan_domisili_id" value={formData.kelurahan_domisili_id} onChange={handleChange} disabled={!formData.kecamatan_domisili_id} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                                    <option value="">-- Pilih Kelurahan --</option>
                                    {domisiliVillages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link to="/pegawai" className="px-6 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                        Batal
                    </Link>
                    <button type="submit" disabled={loading} className="px-8 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2">
                        {loading ? 'Menyimpan Data...' : 'Simpan Data Pegawai'}
                    </button>
                </div>
            </form>
        </div>
    );
}