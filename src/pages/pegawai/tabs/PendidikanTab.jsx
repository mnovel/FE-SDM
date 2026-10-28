import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { pegawaiPendidikanService } from "../../../services/pegawai/pegawaiPendidikanService";
import { masterPendidikanService } from "../../../services/masterdata/masterPendidikanService";
import Toast from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function PendidikanTab() {
  const { pegawai, refreshProfil } = useOutletContext();
  const pegawaiId = pegawai.id;

  const [toast, setToast] = useState(null);
  const [options, setOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    master_pendidikan_id: "",
    nama_institusi: "",
    jurusan: "",
    tahun_lulus: "",
    no_ijazah: "",
  });
  const [fileIjazah, setFileIjazah] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await masterPendidikanService.getAll({ per_page: 100 });
        if (res.success) setOptions(res.data);
      } catch (error) {
        console.error("Gagal load master pendidikan", error);
      }
    };
    fetchMaster();
  }, []);

  const openModal = (item = null) => {
    setFormErrors({});
    setFileIjazah(null);
    if (item) {
      setEditingId(item.id);
      setFormData({
        master_pendidikan_id: item.master_pendidikan_id || "",
        nama_institusi: item.nama_institusi || "",
        jurusan: item.jurusan || "",
        tahun_lulus: item.tahun_lulus || "",
        no_ijazah: item.no_ijazah || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        master_pendidikan_id: "",
        nama_institusi: "",
        jurusan: "",
        tahun_lulus: "",
        no_ijazah: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (fileIjazah) data.append("file_ijazah", fileIjazah);

    try {
      if (editingId)
        await pegawaiPendidikanService.update(pegawaiId, editingId, data);
      else await pegawaiPendidikanService.create(pegawaiId, data);
      showToast("Riwayat pendidikan berhasil disimpan!", "success");
      closeModal();
      refreshProfil();
    } catch (error) {
      if (error.response?.status === 422) {
        const errData = error.response.data;
        if (errData.error && errData.error.details)
          setFormErrors(errData.error.details);
        else if (errData.errors) setFormErrors(errData.errors);
        else showToast(errData.message || "Validasi gagal.", "error");
      } else
        showToast(
          error.response?.data?.message || "Terjadi kesalahan.",
          "error",
        );
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await pegawaiPendidikanService.delete(pegawaiId, deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      refreshProfil();
      showToast("Data berhasil dihapus!", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menghapus data.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 relative">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 pb-3 gap-4">
        <h3 className="text-lg font-bold text-slate-800">Riwayat Pendidikan</h3>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
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
              d="M12 4v16m8-8H4"
            />
          </svg>{" "}
          Tambah Pendidikan
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
              <th className="px-4 py-3 font-semibold">Jenjang</th>
              <th className="px-4 py-3 font-semibold">Institusi</th>
              <th className="px-4 py-3 font-semibold">Jurusan</th>
              <th className="px-4 py-3 font-semibold text-center">
                Tahun Lulus
              </th>
              <th className="px-4 py-3 font-semibold text-center">Ijazah</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pegawai.pendidikan?.length > 0 ? (
              pegawai.pendidikan.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.pendidikan?.nama}
                  </td>
                  <td className="px-4 py-3">{item.nama_institusi}</td>
                  <td className="px-4 py-3">{item.jurusan}</td>
                  <td className="px-4 py-3 text-center">{item.tahun_lulus}</td>
                  <td className="px-4 py-3 text-center">
                    {item.file_ijazah ? (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${item.file_ijazah}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-xs bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>{" "}
                        Lihat
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Tidak ada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
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
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            id: item.id,
                            name: `${item.pendidikan?.nama} - ${item.nama_institusi}`,
                          })
                        }
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-500">
                  Belum ada riwayat pendidikan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId
                  ? "Edit Riwayat Pendidikan"
                  : "Tambah Riwayat Pendidikan"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Jenjang Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="master_pendidikan_id"
                      value={formData.master_pendidikan_id}
                      onChange={handleChange}
                      required
                      className={`w-full appearance-none px-4 py-2 pr-10 border rounded-xl focus:ring-2 outline-none transition-all text-sm cursor-pointer ${formErrors.master_pendidikan_id ? "border-red-400 focus:ring-red-200 bg-slate-50" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white bg-slate-50"}`}
                    >
                      <option value="">-- Pilih Jenjang --</option>
                      {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.nama}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
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
                  {formErrors.master_pendidikan_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.master_pendidikan_id[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tahun Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tahun_lulus"
                    value={formData.tahun_lulus}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.tahun_lulus ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Contoh: 2010"
                  />
                  {formErrors.tahun_lulus && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.tahun_lulus[0]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Institusi / Sekolah{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_institusi"
                    value={formData.nama_institusi}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.nama_institusi ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Contoh: Universitas Airlangga"
                  />
                  {formErrors.nama_institusi && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.nama_institusi[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Jurusan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.jurusan ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Contoh: Kedokteran"
                  />
                  {formErrors.jurusan && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.jurusan[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    No. Ijazah
                  </label>
                  <input
                    type="text"
                    name="no_ijazah"
                    value={formData.no_ijazah}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.no_ijazah ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Nomor Ijazah (Opsional)"
                  />
                  {formErrors.no_ijazah && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.no_ijazah[0]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    File Ijazah (PDF/Gambar)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFileIjazah(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Maksimal 2MB. Biarkan kosong jika tidak ingin mengubah file.
                  </p>
                  {formErrors.file_ijazah && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.file_ijazah[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm disabled:opacity-70"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus Riwayat Pendidikan?"
        message={`Apakah Anda yakin ingin menghapus data pendidikan "${deleteModal.name}"?`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
