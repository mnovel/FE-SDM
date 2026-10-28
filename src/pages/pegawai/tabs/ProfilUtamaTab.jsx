import { useOutletContext } from 'react-router-dom';

export default function ProfilUtamaTab() {
    const { pegawai } = useOutletContext();

    const InfoRow = ({ label, value }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-800 sm:mt-0 sm:col-span-2 font-semibold">{value || '-'}</dd>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Data Diri & Alamat</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kolom Kiri: Data Pribadi */}
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Informasi Pribadi</h4>
                    <dl className="divide-y divide-slate-100">
                        <InfoRow label="Jenis Kelamin" value={pegawai.jenis_kelamin} />
                        <InfoRow label="Tempat, Tanggal Lahir" value={`${pegawai.tempat_lahir || '-'}, ${pegawai.tanggal_lahir ? pegawai.tanggal_lahir.split('T')[0] : '-'}`} />
                        <InfoRow label="Agama" value={pegawai.agama?.nama} />
                        <InfoRow label="Pendidikan Terakhir" value={pegawai.pendidikan_terakhir?.nama} />
                        <InfoRow label="Status Pernikahan" value={pegawai.status_pernikahan?.nama} />
                        <InfoRow label="No. Identitas" value={`${pegawai.jenis_identitas || 'KTP'} - ${pegawai.no_identitas || '-'}`} />
                    </dl>
                </div>

                {/* Kolom Kanan: Alamat */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Alamat Sesuai KTP</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm font-semibold text-slate-800 mb-1">{pegawai.alamat || '-'}</p>
                            <p className="text-sm text-slate-600 mb-2">Kode Pos: {pegawai.kode_pos || '-'}</p>
                            <p className="text-sm text-slate-600">
                                Kel. {pegawai.kelurahan?.name || '-'}, Kec. {pegawai.kecamatan?.name || '-'}<br />
                                {pegawai.kota?.name || '-'}, {pegawai.provinsi?.name || '-'}
                            </p>
                        </div>
                    </div>

                    {pegawai.alamat_domisili ? (
                        <div>
                            <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Alamat Domisili</h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm font-semibold text-slate-800 mb-1">{pegawai.alamat_domisili}</p>
                                <p className="text-sm text-slate-600 mb-2">Kode Pos: {pegawai.kode_pos_domisili || '-'}</p>
                                <p className="text-sm text-slate-600">
                                    Kel. {pegawai.kelurahan_domisili?.name || '-'}, Kec. {pegawai.kecamatan_domisili?.name || '-'}<br />
                                    {pegawai.kota_domisili?.name || '-'}, {pegawai.provinsi_domisili?.name || '-'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                            Tidak ada data alamat domisili (Menggunakan alamat KTP).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}