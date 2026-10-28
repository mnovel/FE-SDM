import { useOutletContext } from 'react-router-dom';

export default function DokumenTab() {
    const { pegawai } = useOutletContext();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Dokumen Pegawai</h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
                            <th className="px-4 py-3 font-semibold">Jenis Dokumen</th>
                            <th className="px-4 py-3 font-semibold">Nomor</th>
                            <th className="px-4 py-3 font-semibold">Tgl Kadaluarsa</th>
                            <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pegawai.dokumen?.length > 0 ? pegawai.dokumen.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{item.jenis_dokumen}</td>
                                <td className="px-4 py-3">{item.nomor_dokumen || '-'}</td>
                                <td className="px-4 py-3">{formatDate(item.tanggal_kadaluarsa)}</td>
                                <td className="px-4 py-3 text-center">
                                    {item.file_path ? (
                                        <a
                                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${item.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-xs bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">Tidak ada file</span>
                                    )}
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="text-center py-4 text-slate-500">Belum ada dokumen yang diunggah</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}