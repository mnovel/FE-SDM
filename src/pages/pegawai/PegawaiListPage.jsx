import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { pegawaiService } from "../../services/pegawai/pegawaiService";
import { masterUnitService } from "../../services/masterdata/masterUnitService";
import { masterJabatanService } from "../../services/masterdata/masterJabatanService";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "../../components/ui/PageHeader";

// ==========================================
// KOMPONEN KUSTOM: SEARCHABLE SELECT DROPDOWN
// ==========================================
function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);
  const filteredOptions = options.filter((opt) =>
    opt.nama.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex justify-between items-center text-sm transition-all ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-orange-400"
        } border-slate-200 focus:ring-orange-500/20`}
      >
        <span
          className={
            selectedOption
              ? "text-slate-800 whitespace-normal break-words pr-2 leading-snug"
              : "text-slate-400"
          }
        >
          {selectedOption ? selectedOption.nama : placeholder}
        </span>
        {!disabled && (
          <svg
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
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
              <svg
                className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto p-1 custom-scrollbar">
            <li
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                !value
                  ? "bg-orange-50 text-orange-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              -- Semua --
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-sm text-center text-slate-400">
                Data tidak ditemukan.
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
                    value === opt.id
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
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
// HALAMAN UTAMA PEGAWAI
// ==========================================
export default function PegawaiListPage() {
  const { logout } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const [loading, setLoading] = useState(true);

  // State Filter
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [page, setPage] = useState(1);

  // State Master Data untuk Dropdown
  const [units, setUnits] = useState([]);
  const [jabatans, setJabatans] = useState([]);

  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "error") => setToast({ message, type });

  // Fetch Master Unit & Jabatan untuk dropdown
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [unitRes, jabatanRes] = await Promise.all([
          masterUnitService.getAll({ per_page: 200 }),
          masterJabatanService.getAll({ per_page: 200 }),
        ]);
        if (unitRes.success) setUnits(unitRes.data);
        if (jabatanRes.success) setJabatans(jabatanRes.data);
      } catch (error) {
        console.error("Gagal load master data filter", error);
      }
    };
    fetchOptions();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, per_page: 15 };
      if (filterGender) params.jenis_kelamin = filterGender;
      if (filterUnit) params.unit_id = filterUnit;
      if (filterJabatan) params.jabatan_id = filterJabatan;

      const response = await pegawaiService.getAll(params);
      if (response.success && response.data) {
        setItems(response.data);
        setMeta({
          page: response.meta.page,
          last_page: response.meta.last_page,
          total: response.meta.total,
          per_page: response.meta.per_page,
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [search, page, filterGender, filterUnit, filterJabatan, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const promptDelete = (pegawai) => {
    const fullName = `${pegawai.gelar_depan ? pegawai.gelar_depan + " " : ""}${pegawai.nama}${pegawai.gelar_belakang ? ", " + pegawai.gelar_belakang : ""}`;
    setDeleteModal({ isOpen: true, id: pegawai.id, name: fullName });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await pegawaiService.delete(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      fetchData();
      showToast("Data Pegawai berhasil dihapus!", "success");
    } catch (error) {
      setDeleteModal({ isOpen: false, id: null, name: "" });
      showToast(
        error.response?.data?.message || "Gagal menghapus data.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative w-full pb-8">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <PageHeader
          title="Data Pegawai"
          description="Kelola direktori data induk pegawai, profil, dan riwayat."
        />
        <Link
          to="/pegawai/create"
          className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap mb-6 sm:mb-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Pegawai
        </Link>
      </div>

      {/* Gunakan overflow-visible agar dropdown tidak terpotong */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
        {/* Toolbar dengan 4 Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-start justify-between bg-white relative z-20 gap-4 rounded-t-2xl">
          <form
            onSubmit={handleSearch}
            className="relative w-full xl:max-w-xs mt-1"
          >
            <input
              type="text"
              placeholder="Cari Nama atau NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
            {/* Filter Unit menggunakan SearchableSelect */}
            <div className="w-full sm:w-56">
              <SearchableSelect
                options={units}
                value={filterUnit}
                onChange={(val) => {
                  setFilterUnit(val);
                  setPage(1);
                }}
                placeholder="Semua Unit Kerja"
              />
            </div>

            {/* Filter Jabatan menggunakan SearchableSelect */}
            <div className="w-full sm:w-56">
              <SearchableSelect
                options={jabatans}
                value={filterJabatan}
                onChange={(val) => {
                  setFilterJabatan(val);
                  setPage(1);
                }}
                placeholder="Semua Jabatan"
              />
            </div>

            {/* Filter Gender (Bisa tetap pakai native select karena pilihannya sedikit) */}
            <div className="relative w-full sm:w-44">
              <select
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm text-slate-700 cursor-pointer"
              >
                <option value="">Semua Gender</option>
                <option value="Laki-Laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto w-full rounded-b-2xl">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-4 sm:px-6 py-4 w-12 text-center">No</th>
                <th className="px-4 sm:px-6 py-4 min-w-[250px]">
                  Profil Pegawai
                </th>
                <th className="px-4 sm:px-6 py-4 min-w-[220px]">
                  Status & Jabatan
                </th>
                <th className="px-4 sm:px-6 py-4">Kontak</th>
                <th className="px-4 sm:px-6 py-4 text-center w-16">L/P</th>
                <th className="px-4 sm:px-6 py-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
                    <p className="font-medium">Memuat data pegawai...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg
                        className="w-16 h-16 mb-4 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-base font-semibold text-slate-600 mb-1">
                        Tidak ada data ditemukan
                      </p>
                      <p className="text-sm">
                        Coba ubah kombinasi filter atau kata kunci Anda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const kpg = item.kepegawaian_aktif;
                  const statusNama = kpg?.status_pegawai?.nama || "-";
                  const jabatan = kpg?.jabatan?.nama || "-";
                  const unit = kpg?.unit?.nama || "-";

                  const baseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    "http://localhost:8000";
                  const fotoUrl = item.foto
                    ? `${baseUrl.replace(/\/api\/?$/, "")}/storage/${item.foto}`
                    : `https://ui-avatars.com/api/?name=${item.nama}&background=random&color=fff&size=64`;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-4 text-slate-400 font-medium text-center">
                        {(meta.page - 1) * meta.per_page + index + 1}
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={fotoUrl}
                            alt={item.nama}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-[15px]">
                              {item.gelar_depan && (
                                <span className="font-normal text-slate-500">
                                  {item.gelar_depan}{" "}
                                </span>
                              )}
                              {item.nama}
                              {item.gelar_belakang && (
                                <span className="font-normal text-slate-500">
                                  , {item.gelar_belakang}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <svg
                                className="w-3.5 h-3.5"
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
                              {item.nip || "Belum ada NIP"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        {kpg ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                {statusNama}
                              </span>
                              <span className="font-semibold text-slate-700 text-sm">
                                {jabatan}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">{unit}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
                            Belum ada status
                          </span>
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-slate-700 text-sm font-medium">
                          {item.email || "-"}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {item.no_hp || "-"}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold shadow-sm ${
                            item.jenis_kelamin === "Laki-Laki" ||
                            item.jenis_kelamin === "L"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-pink-50 text-pink-600 border border-pink-100"
                          }`}
                        >
                          {item.jenis_kelamin === "Laki-Laki" ||
                          item.jenis_kelamin === "L"
                            ? "L"
                            : "P"}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/pegawai/${item.id}`}
                            title="Detail Profil"
                            className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Link>
                          <Link
                            to={`/pegawai/${item.id}/edit`}
                            title="Edit Data"
                            className="p-2 text-orange-600 bg-orange-50/50 hover:bg-orange-100 rounded-lg transition-colors"
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
                          </Link>
                          <button
                            onClick={() => promptDelete(item)}
                            title="Hapus"
                            className="p-2 text-red-600 bg-red-50/50 hover:bg-red-100 rounded-lg transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4 rounded-b-2xl">
            <span className="text-sm text-slate-500 text-center sm:text-left">
              Menampilkan halaman{" "}
              <span className="font-bold text-slate-700">{meta.page}</span> dari{" "}
              <span className="font-bold text-slate-700">{meta.last_page}</span>
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="flex-1 sm:flex-none justify-center px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all shadow-sm"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.page === meta.last_page}
                className="flex-1 sm:flex-none justify-center px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-40 transition-all shadow-sm"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus Data Pegawai?"
        message={`Apakah Anda yakin ingin menghapus data "${deleteModal.name}"? Seluruh riwayat terkait mungkin akan ikut terhapus.`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
