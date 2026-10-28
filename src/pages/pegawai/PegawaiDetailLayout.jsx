import { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, Link } from 'react-router-dom';
import { pegawaiService } from '../../services/pegawai/pegawaiService';
import { useAuth } from '../../context/AuthContext';

export default function PegawaiDetailLayout() {
    const { id } = useParams();
    const { logout } = useAuth();
    const [pegawai, setPegawai] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfil = async () => {
        try {
            const res = await pegawaiService.getProfil(id);
            if (res.success) setPegawai(res.data);
        } catch (error) {
            console.error("Gagal load profil:", error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfil();
    }, [id]);

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Memuat profil pegawai...</div>;
    }

    if (!pegawai) {
        return <div className="p-12 text-center text-red-500">Data pegawai tidak ditemukan.</div>;
    }

    // Cek kepegawaian aktif (untuk badge di header)
    const kepegawaianAktif = pegawai.riwayat_kepegawaian?.find(k => k.is_aktif);
    const unitAktif = kepegawaianAktif?.unit?.nama || '-';
    const jabatanAktif = kepegawaianAktif?.jabatan?.nama || '-';

    const tabs = [
        { name: 'Info Utama', path: '.', end: true },
        { name: 'Kepegawaian', path: 'kepegawaian' },
        { name: 'Keluarga', path: 'keluarga' },
        { name: 'Pendidikan', path: 'pendidikan' },
        { name: 'Nakes', path: 'nakes' },
        { name: 'Rekening', path: 'rekening' },
        { name: 'Dokumen', path: 'dokumen' },
    ];

    return (
        <div className="w-full">
            {/* HEADER PROFIL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {/* Cover Background */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-500 relative">
                    <Link to="/pegawai" className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke List
                    </Link>
                </div>

                {/* Info Dasar */}
                <div className="px-6 sm:px-8 pb-6 flex flex-col sm:flex-row gap-6 relative">
                    {/* Avatar */}
                    <div className="-mt-12 sm:-mt-16 shrink-0 relative z-10">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-md">
                            <img
                                src={pegawai.foto ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${pegawai.foto}` : `https://ui-avatars.com/api/?name=${pegawai.nama}&background=random&size=128`}
                                alt={pegawai.nama}
                                className="w-full h-full object-cover rounded-xl border border-slate-100"
                            />
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 mt-2 sm:mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                    {pegawai.gelar_depan && <span className="font-normal text-slate-600">{pegawai.gelar_depan} </span>}
                                    {pegawai.nama}
                                    {pegawai.gelar_belakang && <span className="font-normal text-slate-600">, {pegawai.gelar_belakang}</span>}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                                    <span className="flex items-center gap-1.5 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                        NIP: {pegawai.nip || '-'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {pegawai.email || '-'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {pegawai.no_hp || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Kepegawaian Badge */}
                            <div className="flex flex-col items-start sm:items-end gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${kepegawaianAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {kepegawaianAktif ? 'Pegawai Aktif' : 'Tidak Ada Status Aktif'}
                                </span>
                                {kepegawaianAktif && (
                                    <div className="text-right mt-1">
                                        <p className="text-sm font-semibold text-slate-800">{jabatanAktif}</p>
                                        <p className="text-xs text-slate-500">{unitAktif}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGASI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
                <nav className="flex px-2 sm:px-4 min-w-max">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            end={tab.end}
                            className={({ isActive }) => `
                                px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200
                                ${isActive
                                    ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}
                            `}
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* KONTEN TAB (Outlet) */}
            {/* Passing data pegawai ke child routes (tabs) via context */}
            <Outlet context={{ pegawai, refreshProfil: fetchProfil }} />
        </div>
    );
}