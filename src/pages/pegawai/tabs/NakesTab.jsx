import { useOutletContext } from 'react-router-dom';

export default function NakesTab() {
    const { pegawai } = useOutletContext();
    const nakes = pegawai.nakes;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (!nakes) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Data Nakes Kosong</h3>
                <p>Pegawai ini belum memiliki data tenaga kesehatan (STR/SIP).</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Informasi Tenaga Kesehatan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4">Profesi</h4>
                    <p className="text-lg font-semibold text-slate-800">{nakes.profesi}</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4">Surat Izin Praktik (SIP)</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><span className="text-slate-500 w-24 inline-block">No. SIP</span>: <strong>{nakes.no_sip || '-'}</strong></p>
                        <p><span className="text-slate-500 w-24 inline-block">Berlaku s/d</span>: {formatDate(nakes.tgl_berakhir_sip)}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4">Surat Tanda Registrasi (STR)</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><span className="text-slate-500 w-24 inline-block">No. STR</span>: <strong>{nakes.no_str || '-'}</strong></p>
                        <p><span className="text-slate-500 w-24 inline-block">Berlaku s/d</span>: {formatDate(nakes.tgl_berakhir_str)}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4">Surat Izin Kerja (SIK)</h4>
                    <p className="text-sm text-slate-700">No. SIK: <strong>{nakes.no_sik || '-'}</strong></p>
                </div>
            </div>
        </div>
    );
}