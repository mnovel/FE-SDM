import { useState, useEffect } from "react";
import { useParams, NavLink, Outlet, Link } from "react-router-dom";
import { pegawaiService } from "../../services/pegawai/pegawaiService";
import { useAuth } from "../../context/AuthContext";

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
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p>Memuat profil pegawai...</p>
      </div>
    );
  }

  if (!pegawai) {
    return (
      <div className="p-12 text-center text-red-500 bg-white rounded-2xl border border-red-100">
        Data pegawai tidak ditemukan.
      </div>
    );
  }

  // Cek kepegawaian aktif
  const kepegawaianAktif = pegawai.riwayat_kepegawaian?.find((k) => k.is_aktif);
  const unitAktif = kepegawaianAktif?.unit?.nama || "-";
  const jabatanAktif = kepegawaianAktif?.jabatan?.nama || "-";
  const statusPegawai = kepegawaianAktif?.status_pegawai?.nama || "-";

  // Tambahan: Ambil TMT Awal dari jabatan aktif
  const tmtAktif = kepegawaianAktif?.tmt_awal
    ? new Date(kepegawaianAktif.tmt_awal).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const tabs = [
    { name: "Info Utama", path: ".", end: true },
    { name: "Kepegawaian", path: "kepegawaian" },
    { name: "Keluarga", path: "keluarga" },
    { name: "Pendidikan", path: "pendidikan" },
    { name: "Nakes", path: "nakes" },
    { name: "Rekening", path: "rekening" },
    { name: "Dokumen", path: "dokumen" },
    { name: "Riwayat Kerja", path: "riwayat-kerja" },
    { name: "Kepanitiaan", path: "kepanitiaan" },
    { name: "Aktivitas Kerja", path: "aktivitas-kerja" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {/* HEADER PROFIL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
        <div className="h-40 sm:h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          <Link
            to="/pegawai"
            className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke List
          </Link>
        </div>

        <div className="px-6 sm:px-10 pb-8 flex flex-col md:flex-row gap-6 md:gap-8 relative">
          <div className="-mt-16 sm:-mt-20 shrink-0 relative z-10">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-1.5 shadow-xl shadow-slate-200/50">
              <img
                src={
                  pegawai.foto
                    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${pegawai.foto}`
                    : `https://ui-avatars.com/api/?name=${pegawai.nama}&background=random&size=256`
                }
                alt={pegawai.nama}
                className="w-full h-full object-cover rounded-2xl border border-slate-100"
              />
            </div>
          </div>

          <div className="flex-1 mt-2 md:mt-4 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {pegawai.gelar_depan && (
                    <span className="font-normal text-slate-500">
                      {pegawai.gelar_depan}{" "}
                    </span>
                  )}
                  {pegawai.nama}
                  {pegawai.gelar_belakang && (
                    <span className="font-normal text-slate-500">
                      , {pegawai.gelar_belakang}
                    </span>
                  )}
                </h1>
                <Link
                  to={`/pegawai/${pegawai.id}/edit`}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Data
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl font-medium">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                  NIP: {pegawai.nip || "-"}
                </span>
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {pegawai.email || "-"}
                </span>
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {pegawai.no_hp || "-"}
                </span>
              </div>
            </div>

            {/* Card Status Kepegawaian */}
            <div className="w-full md:w-auto shrink-0">
              <div
                className={`p-4 rounded-2xl border ${kepegawaianAktif ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`flex h-2.5 w-2.5 rounded-full ${kepegawaianAktif ? "bg-emerald-500" : "bg-red-500"}`}
                  ></span>
                  <span
                    className={`text-sm font-bold ${kepegawaianAktif ? "text-emerald-700" : "text-red-700"}`}
                  >
                    {kepegawaianAktif
                      ? "Pegawai Aktif"
                      : "Tidak Ada Status Aktif"}
                  </span>
                </div>
                {kepegawaianAktif && (
                  <div>
                    <p className="text-base font-bold text-slate-800">
                      {jabatanAktif}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">{unitAktif}</p>

                    {/* TAMPILAN TMT & STATUS */}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md inline-block border border-slate-200 shadow-sm">
                        {statusPegawai}
                      </p>
                      <p className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md inline-block border border-emerald-200 shadow-sm">
                        TMT: {tmtAktif}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGASI (Scrollbar disembunyikan) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        {/* Gunakan class [&::-webkit-scrollbar]:hidden untuk menyembunyikan scrollbar */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex px-2 sm:px-4 min-w-max border-b border-slate-200">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) => `
                                    px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2
                                    ${
                                      isActive
                                        ? "border-orange-500 text-orange-600 bg-orange-50/30"
                                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    }
                                `}
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* KONTEN TAB */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet context={{ pegawai, refreshProfil: fetchProfil }} />
      </div>
    </div>
  );
}
