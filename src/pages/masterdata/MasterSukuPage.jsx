import { useState, useEffect, useCallback } from 'react';
import { masterSukuService } from '../../services/masterdata/masterSukuService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';

export default function MasterSukuPage() {
    const { logout } = useAuth();

    const [sukus, setSukus] = useState([]);
    const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0, per_page: 10 });
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nama: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'error') => setToast({ message, type });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await masterSukuService.getAll({ search, page, per_page: 10 });
            if (response.success && response.data) {
                setSukus(response.data);
                setMeta({
                    page: response.meta.page,
                    last_page: response.meta.last_page,
                    total: response.meta.total,
                    per_page: response.meta.per_page
                });
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [search, page, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const openModal = (suku = null) => {
        setFormErrors({});
        if (suku) {
            setEditingId(suku.id);
            setFormData({ nama: suku.nama });
        } else {
            setEditingId(null);
            setFormData({ nama: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nama: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});
        try {
            if (editingId) {
                await masterSukuService.update(editingId, formData);
            } else {
                await masterSukuService.create(formData);
            }
            closeModal();
            fetchData();
            showToast('Data berhasil disimpan!', 'success');
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

    const promptDelete = (suku) => setDeleteModal({ isOpen: true, id: suku.id, name: suku.nama });

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await masterSukuService.delete(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            fetchData();
            showToast('Data berhasil dihapus!', 'success');
        } catch (error) {
            setDeleteModal({ isOpen: false, id: null, name: '' });
            showToast(error.response?.data?.message || 'Gagal menghapus data.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative w-full">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* HEADER HALAMAN */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <PageHeader
                    title="Master Suku"
                    description="Kelola daftar referensi suku untuk keperluan data pasien."
                />

                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap mb-6 sm:mb-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Suku
                </button>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Toolbar (Search) */}
                <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-20 gap-3">
                    <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
                        <input
                            type="text"
                            placeholder="Cari suku..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>
                </div>

                {/* Tabel Responsif */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse table-auto">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 w-10 sm:w-16 text-center">No</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 w-full">Nama Suku</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right w-20 sm:w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-slate-400">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
                                        <p>Memuat data...</p>
                                    </td>
                                </tr>
                            ) : sukus.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-slate-500">
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                sukus.map((suku, index) => (
                                    <tr key={suku.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-500 font-medium text-center">
                                            {(meta.page - 1) * meta.per_page + index + 1}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-slate-800">
                                            {suku.nama}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button onClick={() => openModal(suku)} title="Edit" className="p-1.5 sm:p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => promptDelete(suku)} title="Hapus" className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && meta.last_page > 1 && (
                    <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-3 sm:gap-4">
                        <span className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                            Halaman <span className="font-semibold text-slate-700">{meta.page}</span> dari <span className="font-semibold text-slate-700">{meta.last_page}</span>
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.page === 1}
                                className="flex-1 sm:flex-none justify-center px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all shadow-sm"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.page === meta.last_page}
                                className="flex-1 sm:flex-none justify-center px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all shadow-sm"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Edit Master Suku' : 'Tambah Master Suku'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 rounded-b-2xl">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Suku</label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.nama ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white'
                                        }`}
                                    placeholder="Contoh: Jawa, Sunda, Batak..."
                                    autoFocus
                                />
                                {formErrors.nama && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">{formErrors.nama[0]}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Hapus Master Suku?"
                message={`Apakah Anda yakin ingin menghapus "${deleteModal.name}"? Data yang dihapus tidak dapat dikembalikan.`}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={executeDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}