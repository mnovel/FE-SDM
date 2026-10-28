import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pegawaiService } from '../../services/pegawai/pegawaiService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';

export default function PegawaiListPage() {
    const { logout } = useAuth();

    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0, per_page: 15 });
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [page, setPage] = useState(1);

    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'error') => setToast({ message, type });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { search, page, per_page: 15 };
            if (filterGender) params.jenis_kelamin = filterGender;

            const response = await pegawaiService.getAll(params);
            if (response.success && response.data) {
                setItems(response.data);
                setMeta({
                    page: response.meta.page,
                    last_page: response.meta.last_page,
                    total: response.meta.total,
                    per_page: response.meta.per_page,
                });
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [search, page, filterGender, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleFilterChange = (e) => {
        setFilterGender(e.target.value);
        setPage(1);
    };

    const promptDelete = (pegawai) => {
        // Menggabungkan gelar untuk nama di modal
        const fullName = `${pegawai.gelar_depan ? pegawai.gelar_depan + ' ' : ''}${pegawai.nama}${pegawai.gelar_belakang ? ', ' + pegawai.gelar_belakang : ''}`;
        setDeleteModal({ isOpen: true, id: pegawai.id, name: fullName });
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await pegawaiService.delete(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            fetchData();
            showToast('Data Pegawai berhasil dihapus!', 'success');
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
                    title="Data Pegawai"
                    description="Kelola direktori data induk pegawai, profil, dan riwayat."
                />
                <Link
                    to="/pegawai/create"
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap mb-6 sm:mb-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Pegawai
                </Link>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-white relative z-20 gap-3">
                    <form onSubmit={handleSearch} className="relative w-full md:max-w-xs">
                        <input
                            type="text"
                            placeholder="Cari Nama atau NIP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>

                    <div className="relative w-full md:w-48">
                        <select
                            value={filterGender}
                            onChange={handleFilterChange}
                            className="w-full appearance-none pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm text-slate-700 cursor-pointer"
                        >
                            <option value="">Semua Gender</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse table-auto">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 w-10 text-center">No</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Nama Lengkap</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">NIP</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Kontak</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center w-20">L/P</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
                                        <p>Memuat data...</p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-500">
                                        Tidak ada data pegawai ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-3 sm:px-6 py-3 text-slate-500 font-medium text-center">
                                            {(meta.page - 1) * meta.per_page + index + 1}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3">
                                            <div className="font-semibold text-slate-800">
                                                {item.gelar_depan && <span className="font-normal text-slate-500">{item.gelar_depan} </span>}
                                                {item.nama}
                                                {item.gelar_belakang && <span className="font-normal text-slate-500">, {item.gelar_belakang}</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-500 sm:hidden mt-0.5">{item.nip || '-'}</div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 hidden sm:table-cell text-slate-600">
                                            {item.nip || '-'}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 text-slate-600 text-xs">
                                            <div>{item.email || '-'}</div>
                                            <div className="text-slate-400">{item.no_hp || '-'}</div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${item.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                                }`}>
                                                {item.jenis_kelamin}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <Link to={`/pegawai/${item.id}`} title="Detail Profil" className="p-1.5 sm:p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                <Link to={`/pegawai/${item.id}/edit`} title="Edit Data" className="p-1.5 sm:p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button onClick={() => promptDelete(item)} title="Hapus" className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page === 1} className="flex-1 sm:flex-none justify-center px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all">Sebelumnya</button>
                            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.page === meta.last_page} className="flex-1 sm:flex-none justify-center px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all">Selanjutnya</button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Hapus Data Pegawai?"
                message={`Apakah Anda yakin ingin menghapus data "${deleteModal.name}"? Seluruh riwayat terkait mungkin akan ikut terhapus.`}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={executeDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}