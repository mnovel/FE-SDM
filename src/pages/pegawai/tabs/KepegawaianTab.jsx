import { useOutletContext } from 'react-router-dom';

export default function KepegawaianTab() {
    const { pegawai } = useOutletContext();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const TableWrapper = ({ title, children }) => (
        <div className="mb-8 last:mb-0">
            <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">{title}</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                    {children}
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-2">

            {/* 1. Riwayat Kepegawaian */}
            <TableWrapper title="Status & Riwayat Kepegawaian">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Status Pegawai</th>
                        <th className="px-4 py-3 font-semibold">Unit Kerja</th>
                        <th className="px-4 py-3 font-semibold">Jabatan</th>
                        <th className="px-4 py-3 font-semibold">TMT Awal</th>
                        <th className="px-4 py-3 font-semibold">TMT Akhir</th>
                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {pegawai.riwayat_kepegawaian?.length > 0 ? pegawai.riwayat_kepegawaian.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.status_pegawai?.nama}</td>
                            <td className="px-4 py-3">{item.unit?.nama}</td>
                            <td className="px-4 py-3">{item.jabatan?.nama}</td>
                            <td className="px-4 py-3">{formatDate(item.tmt_awal)}</td>
                            <td className="px-4 py-3">{formatDate(item.tmt_akhir)}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.is_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {item.is_aktif ? 'Aktif' : 'Selesai'}
                                </span>
                            </td>
                        </tr>
                    )) : <tr><td colSpan="6" className="text-center py-4 text-slate-500">Belum ada data</td></tr>}
                </tbody>
            </TableWrapper>

            {/* 2. Kepangkatan */}
            <TableWrapper title="Riwayat Kepangkatan">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Pangkat / Golongan</th>
                        <th className="px-4 py-3 font-semibold">No. SK</th>
                        <th className="px-4 py-3 font-semibold">TMT</th>
                        <th className="px-4 py-3 font-semibold">Status Kerja</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {pegawai.kepangkatan?.length > 0 ? pegawai.kepangkatan.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.pangkat?.pangkat} ({item.pangkat?.golongan})</td>
                            <td className="px-4 py-3">{item.no_sk}</td>
                            <td className="px-4 py-3">{formatDate(item.tmt)}</td>
                            <td className="px-4 py-3">{item.status_kerja}</td>
                        </tr>
                    )) : <tr><td colSpan="4" className="text-center py-4 text-slate-500">Belum ada data</td></tr>}
                </tbody>
            </TableWrapper>

            {/* 3. Jabatan Struktural */}
            <TableWrapper title="Riwayat Jabatan Struktural">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Jabatan</th>
                        <th className="px-4 py-3 font-semibold">Unit</th>
                        <th className="px-4 py-3 font-semibold">No. SK</th>
                        <th className="px-4 py-3 font-semibold">Tanggal Awal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {pegawai.jabatan_struktural?.length > 0 ? pegawai.jabatan_struktural.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.jabatan?.nama}</td>
                            <td className="px-4 py-3">{item.unit?.nama}</td>
                            <td className="px-4 py-3">{item.no_sk}</td>
                            <td className="px-4 py-3">{formatDate(item.tanggal_awal)}</td>
                        </tr>
                    )) : <tr><td colSpan="4" className="text-center py-4 text-slate-500">Belum ada data</td></tr>}
                </tbody>
            </TableWrapper>

        </div>
    );
}