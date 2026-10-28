import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { pegawaiKeluargaService } from '../../../services/pegawai/pegawaiKeluargaService';
import Toast from '../../../components/ui/Toast';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const HUBUNGAN_OPTIONS = ['Suami', 'Istri', 'Anak', 'Ayah', 'Ibu'];

export default function KeluargaTab() {
    const { pegawai, refreshProfil } = useOutletContext();
    const pegawaiId = pegawai.id;

    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        nama: '',
        hubungan: 'Anak',
        nik: '',
        no_bpjs: '',
        tanggal_lahir: '',
        is_tanggungan: true,
    });

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'error') => setToast({ message, type });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const openModal = (item = null) => {
        setFormErrors({});
        if (item) {
            setEditingId(item.id);
            setFormData({
                nama: item.nama,
                hubungan: item.hubungan,
                nik: item.nik || '',
                no_bpjs: item.no_bpjs || '',
                tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '',
                is_tanggungan: !!item.is_tanggungan,
            });
        } else {
            setEditingId(null);
            setFormData({ nama: '', hubungan: 'Anak', nik: '', no_bpjs: '', tanggal_lahir: '', is_tanggungan: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = value;

        // Filter hanya angka untuk NIK dan BPJS
        if (name === 'nik' || name === 'no_bpjs') {
            newValue = value.replace(/\D/g, ''); // Hapus semua karakter non-angka

            // Batasi panjang
            if (name === 'nik' && newValue.length > 16) {
                newValue = newValue.slice(0, 16);
            }
            if (name === 'no_bpjs' && newValue.length > 13) {
                newValue = newValue.slice(0, 13);
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        try {
            if (editingId) {
                await pegawaiKeluargaService.update(pegawaiId, editingId, formData);
                showToast('Data keluarga berhasil diperbarui!', 'success');
            } else {
                await pegawaiKeluargaService.create(pegawaiId, formData);
                showToast('Anggota keluarga berhasil ditambahkan!', 'success');
            }
            closeModal();
            refreshProfil(); // Refresh data profil utama agar tabel terupdate
        } catch (error) {
            if (error.response?.status === 422) {
                const errData = error.response.data;
                if (errData.error && errData.error.details) setFormErrors(errData.error.details);
                else if (errData.errors) setFormErrors(errData.errors);
                else showToast(errData.message || 'Validasi gagal.', 'error');
            } else {
                showToast(error.response?.data?.message || 'Terjadi kesalahan.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDelete = (item) => setDeleteModal({ isOpen: true, id: item.id, name: item.nama });

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await pegawaiKeluargaService.delete(pegawaiId, deleteModal.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            refreshProfil(); // Refresh data tabel
            showToast('Data berhasil dihapus!', 'success');
        } catch (error) {
            setDeleteModal({ isOpen: false, id: null, name: '' });
            showToast(error.response?.data?.message || 'Gagal menghapus data.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 relative">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 pb-3 gap-4">
                <h3 className="text-lg font-bold text-slate-800">Data Keluarga</h3>
                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Tambah Anggota
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
                            <th className="px-4 py-3 font-semibold">Nama Anggota</th>
                            <th className="px-4 py-3 font-semibold">Hubungan</th>
                            <th className="px-4 py-3 font-semibold">NIK</th>
                            <th className="px-4 py-3 font-semibold">No. BPJS</th>
                            <th className="px-4 py-3 font-semibold">Tgl Lahir</th>
                            <th className="px-4 py-3 font-semibold text-center">Tanggungan</th>
                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pegawai.keluarga?.length > 0 ? pegawai.keluarga.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{item.nama}</td>
                                <td className="px-4 py-3">{item.hubungan}</td>
                                <td className="px-4 py-3">{item.nik || '-'}</td>
                                <td className="px-4 py-3">{item.no_bpjs || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.tanggal_lahir)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.is_tanggungan ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.is_tanggungan ? 'Ya' : 'Tidak'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openModal(item)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => promptDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-slate-500">Belum ada data keluarga</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM KELUARGA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Edit Data Keluarga' : 'Tambah Anggota Keluarga'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" name="nama" value={formData.nama} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                                    {formErrors.nama && <p className="text-red-500 text-xs mt-1">{formErrors.nama[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hubungan <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="hubungan" value={formData.hubungan} onChange={handleChange} required className="w-full appearance-none px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm cursor-pointer">
                                            {HUBUNGAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
                                    <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm" />
                                    {formErrors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_lahir[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">NIK</label>
                                    <input
                                        type="text"
                                        name="nik"
                                        value={formData.nik}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={16}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm"
                                        placeholder="16 Digit NIK"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">No. BPJS</label>
                                    <input
                                        type="text"
                                        name="no_bpjs"
                                        value={formData.no_bpjs}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={13}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 text-sm"
                                        placeholder="13 Digit BPJS"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex items-center gap-3 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <input type="checkbox" id="is_tanggungan" name="is_tanggungan" checked={formData.is_tanggungan} onChange={handleChange} className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer" />
                                    <label htmlFor="is_tanggungan" className="text-sm font-medium text-slate-700 cursor-pointer">Jadikan sebagai tanggungan (Tunjangan Keluarga)</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm disabled:opacity-70">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Hapus Data Keluarga?"
                message={`Apakah Anda yakin ingin menghapus "${deleteModal.name}" dari daftar keluarga?`}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={executeDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}