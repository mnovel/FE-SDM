import { useOutletContext } from 'react-router-dom';

export default function RekeningTab() {
    const { pegawai } = useOutletContext();
    const rek = pegawai.rekening;

    if (!rek) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Data Rekening Kosong</h3>
                <p>Pegawai ini belum memiliki data rekening bank.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Informasi Rekening Bank</h3>

            <div className="max-w-md bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Bank</p>
                        <p className="text-lg font-bold text-slate-800">{rek.nama_bank}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Nomor Rekening</p>
                        <p className="text-xl font-mono font-semibold text-slate-800 tracking-widest">{rek.no_rekening}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Atas Nama</p>
                        <p className="text-sm font-semibold text-slate-800">{rek.atas_nama}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}