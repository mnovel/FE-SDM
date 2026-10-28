import { useState, useEffect, useCallback, useRef } from 'react';
import { masterUnitService } from '../../services/masterdata/masterUnitService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';

// ==========================================
// KOMPONEN KUSTOM: SEARCHABLE SELECT DROPDOWN (DENGAN WRAP TEXT)
// ==========================================
function SearchableSelect({ options, value, onChange, placeholder, error, disabled, hideLevel }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.id === value);
    const filteredOptions = options.filter((opt) =>
        opt.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                onClick={() => {
                    if (disabled) return;
                    setIsOpen(!isOpen);
                    setSearch('');
                }}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex justify-between items-center text-sm transition-all ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-orange-400'
                    } ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-orange-500/20'}`}
            >
                <span className={selectedOption ? 'text-slate-800 whitespace-normal break-words pr-2 leading-snug' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.nama : placeholder}
                </span>
                {!disabled && (
                    <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[70] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ketik untuk mencari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                autoFocus
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <ul className="max-h-56 overflow-y-auto p-1 custom-scrollbar">
                        <li
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${!value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            -- Kosongkan / Semua --
                        </li>
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-4 text-sm text-center text-slate-400">Data tidak ditemukan.</li>
                        ) : (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.id}
                                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                    className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${value === opt.id ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {/* Badge level hanya muncul jika hideLevel bernilai falsy / tidak aktif */}
                                    {!hideLevel && opt.level && (
                                        <span className="shrink-0 whitespace-nowrap text-slate-500 text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                            Lv. {opt.level}
                                        </span>
                                    )}
                                    <span className="flex-1 whitespace-normal break-words leading-snug">
                                        {opt.nama}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ==========================================
// HALAMAN UTAMA
// ==========================================
export default function MasterUnitPage() {
    const { logout } = useAuth();

    const [units, setUnits] = useState([]);
    const [allUnitsForParent, setAllUnitsForParent] = useState([]);
    const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0, per_page: 10 });
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterParentId, setFilterParentId] = useState('');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nama: '', nama_singkat: '', parent_id: '', status: 'Aktif'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'error') => setToast({ message, type });

    const fetchAllUnits = useCallback(async () => {
        try {
            const res = await masterUnitService.getAll({ per_page: 100 });
            if (res.success && res.data) {
                const sorted = [...res.data].sort((a, b) => {
                    if (a.level !== b.level) return a.level - b.level;
                    return a.nama.localeCompare(b.nama);
                });
                setAllUnitsForParent(sorted);
            }
        } catch (error) {
            console.error('Gagal mengambil data unit untuk dropdown:', error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await masterUnitService.getAll({
                search: search,
                page: page,
                per_page: 10,
                status: filterStatus,
                parent_id: filterParentId
            });

            if (response.success && response.data) {
                setUnits(response.data);
                setMeta({
                    page: response.meta.page, last_page: response.meta.last_page,
                    total: response.meta.total, per_page: response.meta.per_page
                });
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, page, filterStatus, filterParentId]);

    useEffect(() => {
        fetchAllUnits();
    }, [fetchAllUnits]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const openModal = (unit = null) => {
        setFormErrors({});
        if (unit) {
            setEditingId(unit.id);
            setFormData({
                nama: unit.nama,
                nama_singkat: unit.nama_singkat,
                status: unit.status,
                parent_id: unit.parent_id || ''
            });
        } else {
            setEditingId(null);
            setFormData({ nama: '', nama_singkat: '', parent_id: '', status: 'Aktif' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        const payload = {
            ...formData,
            parent_id: formData.parent_id === '' ? null : formData.parent_id
        };

        try {
            if (editingId) {
                await masterUnitService.update(editingId, payload);
            } else {
                await masterUnitService.create(payload);
            }
            closeModal();
            fetchData();
            fetchAllUnits();
            showToast('Data berhasil disimpan!', 'success');
        } catch (error) {
            if (error.response?.status === 422) {
                const errData = error.response.data;
                if (errData.error && errData.error.details) {
                    setFormErrors(errData.error.details);
                } else if (errData.errors) {
                    setFormErrors(errData.errors);
                } else {
                    showToast(errData.message || 'Validasi gagal.', 'error');
                }
            } else {
                showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDelete = (unit) => {
        setDeleteModal({ isOpen: true, id: unit.id, name: unit.nama });
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await masterUnitService.delete(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            fetchData();
            fetchAllUnits();
            showToast('Data berhasil dihapus!', 'success');
        } catch (error) {
            setDeleteModal({ isOpen: false, id: null, name: '' });
            showToast(error.response?.data?.message || 'Gagal menghapus data.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const availableParents = allUnitsForParent.filter(u => u.id !== editingId);

    return (
        <div className="relative w-full">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* HEADER HALAMAN */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <PageHeader
                    title="Master Unit"
                    description="Kelola data unit, sub-unit, dan struktur hierarkinya."
                />

                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap mb-6 sm:mb-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Unit
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Toolbar (Search & Filter) */}
                <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white gap-3 relative z-20">
                    <form onSubmit={handleSearch} className="relative w-full xl:max-w-xs">
                        <input
                            type="text"
                            placeholder="Cari nama atau singkatan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
                        {/* Filter Status */}
                        <div className="w-full sm:w-48">
                            <SearchableSelect
                                options={[
                                    { id: 'Aktif', nama: 'Aktif' },
                                    { id: 'Tidak Aktif', nama: 'Tidak Aktif' }
                                ]}
                                value={filterStatus}
                                onChange={(val) => { setFilterStatus(val); setPage(1); }}
                                placeholder="Semua Status"
                                hideLevel={true}
                            />
                        </div>

                        {/* Filter Parent Unit */}
                        <div className="w-full sm:w-64">
                            <SearchableSelect
                                options={allUnitsForParent.filter(u => u.level <= 3)}
                                value={filterParentId}
                                onChange={(val) => { setFilterParentId(val); setPage(1); }}
                                placeholder="Semua Induk (Lv 1, 2, & 3)"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabel Responsif */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-4 sm:px-6 py-3 sm:py-4 w-16 text-center">No</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Nama Unit</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Singkatan</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">Level</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Induk (Parent)</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">Status</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right w-24 sm:w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
                                        <p>Memuat data...</p>
                                    </td>
                                </tr>
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-500">
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                units.map((unit, index) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/85 transition-colors group">
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-medium text-center">
                                            {(meta.page - 1) * meta.per_page + index + 1}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-800">
                                            {unit.nama}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500">
                                            {unit.nama_singkat}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                                                {unit.level}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600">
                                            {unit.parent?.nama || <span className="text-slate-400 italic">-</span>}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${unit.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                {unit.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button onClick={() => openModal(unit)} title="Edit" className="p-1.5 sm:p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-md sm:rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => promptDelete(unit)} title="Hapus" className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors">
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

                {/* Pagination Modern */}
                {!loading && meta.last_page > 1 && (
                    <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-3 sm:gap-4">
                        <span className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                            Menampilkan halaman <span className="font-semibold text-slate-700">{meta.page}</span> dari <span className="font-semibold text-slate-700">{meta.last_page}</span>
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

            {/* MODAL FORM MODERN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Master Unit' : 'Tambah Master Unit'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 rounded-b-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Induk Unit</label>
                                    <SearchableSelect
                                        options={availableParents.filter(u => u.level <= 3)}
                                        value={formData.parent_id}
                                        onChange={(val) => setFormData({ ...formData, parent_id: val })}
                                        placeholder="-- Tanpa Induk (Jadikan Unit Utama) --"
                                        error={formErrors.parent_id}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Biarkan kosong jika ini adalah unit tingkat teratas (Level 1).</p>
                                    {formErrors.parent_id && <p className="mt-1.5 text-xs text-red-500 font-medium">{formErrors.parent_id[0]}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Unit <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.nama ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white'}`} placeholder="Contoh: Instalasi Rawat Inap" />
                                    {formErrors.nama && <p className="mt-1.5 text-xs text-red-500 font-medium">{formErrors.nama[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Singkat <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.nama_singkat} onChange={(e) => setFormData({ ...formData, nama_singkat: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.nama_singkat ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white'}`} placeholder="Contoh: RANAP" />
                                    {formErrors.nama_singkat && <p className="mt-1.5 text-xs text-red-500 font-medium">{formErrors.nama_singkat[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Status <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm appearance-none cursor-pointer">
                                            <option value="Aktif">Aktif</option>
                                            <option value="Tidak Aktif">Tidak Aktif</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {formErrors.status && <p className="mt-1.5 text-xs text-red-500 font-medium">{formErrors.status[0]}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PANGGIL KOMPONEN KONFIRMASI HAPUS */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Hapus Master Unit?"
                message={`Apakah Anda yakin ingin menghapus "${deleteModal.name}"? Data yang dihapus tidak dapat dikembalikan.`}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={executeDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}