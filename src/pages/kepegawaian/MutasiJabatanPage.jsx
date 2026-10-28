import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // IMPORT INI UNTUK REDIRECT
import { pegawaiService } from "../../services/pegawai/pegawaiService";
import { masterUnitService } from "../../services/masterdata/masterUnitService";
import { masterJabatanService } from "../../services/masterdata/masterJabatanService";
import { masterStatusPegawaiService } from "../../services/masterdata/masterStatusPegawaiService";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";

// ==========================================
// KOMPONEN KUSTOM: SEARCHABLE SELECT DROPDOWN
// ==========================================
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  isObj = false,
}) {
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

  // Helper untuk mendapatkan nama dari options (mendukung format objek Pegawai)
  const getOptionName = (opt) => {
    if (isObj && opt.gelar_depan !== undefined) {
      return `${opt.gelar_depan || ""} ${opt.nama} ${opt.gelar_belakang || ""} (${opt.nip || "Tanpa NIP"})`;
    }
    return opt.nama;
  };

  const selectedOption = options.find(
    (opt) => String(opt.id) === String(value),
  );
  const filteredOptions = options.filter((opt) =>
    getOptionName(opt).toLowerCase().includes(search.toLowerCase()),
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
        } ${error ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20"}`}
      >
        <span
          className={
            selectedOption ? "text-slate-800 truncate pr-2" : "text-slate-400"
          }
        >
          {selectedOption ? getOptionName(selectedOption) : placeholder}
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
              -- Pilih --
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
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors flex items-center ${
                    String(value) === String(opt.id)
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{getOptionName(opt)}</span>
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
// HALAMAN UTAMA MUTASI JABATAN
// ==========================================
export default function MutasiJabatanPage() {
  const navigate = useNavigate(); // INISIALISASI NAVIGATE
  const [toast, setToast] = useState(null);

  // Master Data
  const [employees, setEmployees] = useState([]);
  const [units, setUnits] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // State Form
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("");
  const [pegawaiDetail, setPegawaiDetail] = useState(null);

  const [formData, setFormData] = useState({
    master_status_pegawai_id: "",
    master_unit_id: "",
    master_jabatan_id: "",
    no_sk: "",
    tmt_awal: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "error") => setToast({ message: msg, type });

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [empRes, unitRes, jabRes, statRes] = await Promise.all([
          pegawaiService.getAll({ per_page: 1000 }),
          masterUnitService.getAll({ per_page: 200 }),
          masterJabatanService.getAll({ per_page: 500 }),
          masterStatusPegawaiService.getAll({ per_page: 100 }),
        ]);

        if (empRes.success) setEmployees(empRes.data);
        if (unitRes.success) setUnits(unitRes.data);
        if (jabRes.success) setJabatans(jabRes.data);
        if (statRes.success) setStatuses(statRes.data);
      } catch (error) {
        console.error("Gagal load master data", error);
      }
    };
    fetchMaster();
  }, []);

  // 2. Fetch Detail Pegawai saat dipilih
  useEffect(() => {
    if (!selectedPegawaiId) {
      setPegawaiDetail(null);
      return;
    }

    const fetchPegawai = async () => {
      setFetching(true);
      try {
        const res = await pegawaiService.getProfil(selectedPegawaiId);
        if (res.success) {
          setPegawaiDetail(res.data);

          // Pre-fill form dengan data saat ini
          const currentKpg = res.data.riwayat_kepegawaian?.find(
            (k) => k.is_aktif,
          );
          if (currentKpg) {
            setFormData((prev) => ({
              ...prev,
              master_status_pegawai_id: currentKpg.master_status_pegawai_id,
              master_unit_id: currentKpg.master_unit_id,
              master_jabatan_id: currentKpg.master_jabatan_id,
            }));
          }
        }
      } catch (error) {
        showToast("Gagal load data pegawai", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchPegawai();
  }, [selectedPegawaiId]);

  // 3. Logika Filter Jabatan berdasarkan Unit
  const filteredJabatans = formData.master_unit_id
    ? jabatans.filter(
        (j) =>
          String(j.unit_id) === String(formData.master_unit_id) ||
          String(j.unit?.id) === String(formData.master_unit_id),
      )
    : [];

  // Handler saat Unit diubah
  const handleUnitChange = (unitId) => {
    setFormData((prev) => ({
      ...prev,
      master_unit_id: unitId,
      master_jabatan_id: "", // Reset jabatan jika unit berubah
    }));
  };

  // 4. Submit Mutasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPegawaiId) {
      showToast("Pilih pegawai terlebih dahulu!", "error");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = { ...formData, is_aktif: true };
      const res = await pegawaiService.createKepegawaian(
        selectedPegawaiId,
        payload,
      );

      if (res.success) {
        showToast("Mutasi Jabatan berhasil diproses!", "success");

        // REDIRECT KE PROFIL PEGAWAI (TAB KEPEGAWAIAN)
        setTimeout(() => {
          navigate(`/pegawai/${selectedPegawaiId}/kepegawaian`);
        }, 1000);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        showToast(
          error.response?.data?.message || "Terjadi kesalahan.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="mb-6">
        <PageHeader
          title="Mutasi Jabatan & Unit"
          description="Proses perpindahan unit kerja atau perubahan jabatan pegawai."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KIRI: Pilih Pegawai & Info Saat Ini */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-bold text-slate-800 mb-3">
              1. Pilih Pegawai
            </label>
            <SearchableSelect
              options={employees}
              value={selectedPegawaiId}
              onChange={(val) => setSelectedPegawaiId(val)}
              placeholder="Cari Nama / NIP Pegawai..."
              isObj={true}
            />
          </div>

          {fetching && (
            <div className="text-center text-sm text-slate-500 animate-pulse">
              Memuat profil pegawai...
            </div>
          )}

          {pegawaiDetail && (
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 animate-in fade-in">
              <h4 className="text-sm font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2">
                Posisi Saat Ini
              </h4>
              {(() => {
                const current = pegawaiDetail.riwayat_kepegawaian?.find(
                  (k) => k.is_aktif,
                );
                if (!current)
                  return (
                    <p className="text-sm text-red-500 italic">
                      Pegawai belum memiliki status aktif.
                    </p>
                  );
                return (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Status Pegawai
                      </span>
                      <p className="font-semibold text-slate-800">
                        {current.status_pegawai?.nama}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Unit Kerja
                      </span>
                      <p className="font-semibold text-slate-800">
                        {current.unit?.nama}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Jabatan
                      </span>
                      <p className="font-semibold text-slate-800">
                        {current.jabatan?.nama}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-xs">
                          TMT Awal
                        </span>
                        <p className="font-medium text-slate-700">
                          {new Date(current.tmt_awal).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">
                          TMT Akhir
                        </span>
                        <p className="font-medium text-slate-700">
                          {current.tmt_akhir ? (
                            new Date(current.tmt_akhir).toLocaleDateString(
                              "id-ID",
                            )
                          ) : (
                            <span className="text-orange-500 italic">
                              Masih Aktif
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* KANAN: Form Mutasi */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
              2. Data Mutasi Baru
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status Pegawai <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={statuses}
                  value={formData.master_status_pegawai_id}
                  onChange={(val) =>
                    setFormData({ ...formData, master_status_pegawai_id: val })
                  }
                  placeholder="-- Pilih Status --"
                  error={errors.master_status_pegawai_id}
                />
                {errors.master_status_pegawai_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.master_status_pegawai_id[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  TMT Awal (Tanggal Efektif){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tmt_awal}
                  onChange={(e) =>
                    setFormData({ ...formData, tmt_awal: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                />
                {errors.tmt_awal && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tmt_awal[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Unit Kerja Baru <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={units}
                  value={formData.master_unit_id}
                  onChange={handleUnitChange} // Gunakan handler khusus
                  placeholder="-- Cari & Pilih Unit Kerja Baru --"
                  error={errors.master_unit_id}
                />
                {errors.master_unit_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.master_unit_id[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jabatan Baru <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={filteredJabatans} // GUNAKAN DATA YANG SUDAH DIFILTER
                  value={formData.master_jabatan_id}
                  onChange={(val) =>
                    setFormData({ ...formData, master_jabatan_id: val })
                  }
                  placeholder={
                    formData.master_unit_id
                      ? "-- Cari & Pilih Jabatan --"
                      : "-- Pilih Unit Terlebih Dahulu --"
                  }
                  error={errors.master_jabatan_id}
                  disabled={!formData.master_unit_id} // WAJIBKAN PILIH UNIT DULU
                />
                {errors.master_jabatan_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.master_jabatan_id[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nomor SK Mutasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.no_sk}
                  onChange={(e) =>
                    setFormData({ ...formData, no_sk: e.target.value })
                  }
                  required
                  placeholder="Contoh: 800/1234/2024"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                />
                {errors.no_sk && (
                  <p className="text-red-500 text-xs mt-1">{errors.no_sk[0]}</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-amber-700">
                  Menyimpan form ini akan{" "}
                  <strong>menonaktifkan otomatis</strong> jabatan/unit yang
                  lama, mengisi TMT Akhir, dan menyinkronkan data ke Riwayat
                  Jabatan Struktural.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading || !selectedPegawaiId}
                className="px-8 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? "Memproses..." : "Proses Mutasi Jabatan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
