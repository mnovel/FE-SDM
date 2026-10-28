import { useOutletContext } from 'react-router-dom';

export default function PendidikanTab() {
    const { pegawai } = useOutletContext();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Riwayat Pendidikan</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Jenjang</th>
                            <th className="px-4 py-3 font-semibold">Institusi</th>
                            <th className="px-4 py-3 font-semibold">Jurusan</th>
                            <th className="px-4 py-3 font-semibold">Tahun Lulus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pegawai.pendidikan?.length > 0 ? pegawai.pendidikan.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{item.pendidikan?.nama}</td>
                                <td className="px-4 py-3">{item.nama_institusi}</td>
                                <td className="px-4 py-3">{item.jurusan}</td>
                                <td className="px-4 py-3">{item.tahun_lulus}</td>
                            </tr>
                        )) : <tr><td colSpan="4" className="text-center py-4 text-slate-500">Belum ada data</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}