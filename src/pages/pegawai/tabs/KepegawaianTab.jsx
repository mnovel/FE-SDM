import { useOutletContext } from "react-router-dom";

export default function KepegawaianTab() {
  const { pegawai } = useOutletContext();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fungsi untuk menentukan status berdasarkan tanggal
  const getStatusInfo = (item) => {
    if (item.is_aktif) {
      return {
        label: "Aktif",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tmtAwal = new Date(item.tmt_awal);
    tmtAwal.setHours(0, 0, 0, 0);

    if (tmtAwal > today) {
      return {
        label: "Terjadwal",
        color: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }
    return {
      label: "Selesai",
      color: "bg-slate-100 text-slate-600 border-slate-200",
    };
  };

  // Urutkan: Aktif di atas -> Terjadwal -> Selesai (berdasarkan tanggal terbaru)
  const sortedKepegawaian = [...(pegawai.riwayat_kepegawaian || [])].sort(
    (a, b) => {
      if (a.is_aktif && !b.is_aktif) return -1;
      if (!a.is_aktif && b.is_aktif) return 1;

      const dateA = new Date(a.tmt_awal).getTime();
      const dateB = new Date(b.tmt_awal).getTime();
      const today = new Date().setHours(0, 0, 0, 0);

      const aFuture = dateA > today;
      const bFuture = dateB > today;

      if (aFuture && !bFuture) return -1; // Terjadwal naik ke atas
      if (!aFuture && bFuture) return 1;

      return dateB - dateA;
    },
  );

  const CardTable = ({ title, children, className = "" }) => (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 ${className}`}
    >
      <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        {title}
      </h4>
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          {children}
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Riwayat Kepegawaian */}
      <CardTable title="Status & Riwayat Kepegawaian">
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
          {sortedKepegawaian.length > 0 ? (
            sortedKepegawaian.map((item) => {
              const status = getStatusInfo(item);
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${item.is_aktif ? "bg-orange-50/40" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.status_pegawai?.nama}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {item.unit?.nama}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.jabatan?.nama}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {formatDate(item.tmt_awal)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(item.tmt_akhir)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-6 text-slate-500">
                Belum ada data
              </td>
            </tr>
          )}
        </tbody>
      </CardTable>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 2. Kepangkatan */}
        <CardTable title="Riwayat Kepangkatan">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Pangkat / Gol</th>
              <th className="px-4 py-3 font-semibold">No. SK</th>
              <th className="px-4 py-3 font-semibold">TMT</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pegawai.kepangkatan?.length > 0 ? (
              pegawai.kepangkatan.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.pangkat?.pangkat} <br />
                    <span className="text-xs text-slate-500 font-normal">
                      ({item.pangkat?.golongan})
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.no_sk}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(item.tmt)}
                  </td>
                  <td className="px-4 py-3">{item.status_kerja}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </CardTable>

        {/* 3. Jabatan Struktural */}
        <CardTable title="Riwayat Jabatan Struktural">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Jabatan</th>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">No. SK</th>
              <th className="px-4 py-3 font-semibold">Tgl Awal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pegawai.jabatan_struktural?.length > 0 ? (
              pegawai.jabatan_struktural.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.jabatan?.nama}
                  </td>
                  <td className="px-4 py-3">{item.unit?.nama}</td>
                  <td className="px-4 py-3">{item.no_sk}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(item.tanggal_awal)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </CardTable>
      </div>
    </div>
  );
}
