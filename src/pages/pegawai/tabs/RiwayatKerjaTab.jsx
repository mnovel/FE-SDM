import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { pegawaiRiwayatKerjaService } from "../../../services/pegawai/pegawaiRiwayatKerjaService";
import Toast from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function RiwayatKerjaTab() {
  const { pegawai, refreshProfil } = useOutletContext();
  const listData = pegawai.riwayat_kerja || [];

  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    no_surat: "",
    unit_kerja: "",
    klasifikasi: "Internal",
    posisi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });
  const [fileBerkas, setFileBerkas] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg, type = "error") => setToast({ message: msg, type });
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  const openModal = (item = null) => {
    setFormErrors({});
    setFileBerkas(null);
    if (item) {
      setEditingId(item.id);
      setFormData({
        no_surat: item.no_surat || "",
        unit_kerja: item.unit_kerja || "",
        klasifikasi: item.klasifikasi || "Internal",
        posisi: item.posisi || "",
        tanggal_mulai: item.tanggal_mulai
          ? item.tanggal_mulai.split("T")[0]
          : "",
        tanggal_selesai: item.tanggal_selesai
          ? item.tanggal_selesai.split("T")[0]
          : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        no_surat: "",
        unit_kerja: "",
        klasifikasi: "Internal",
        posisi: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
      });
    }
    setIsModalOpen(true);
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
      if (formData[key]) data.append(key, formData[key]);
    });
    if (fileBerkas) data.append("file_berkas", fileBerkas);

    try {
      if (editingId)
        await pegawaiRiwayatKerjaService.update(pegawai.id, editingId, data);
      else await pegawaiRiwayatKerjaService.create(pegawai.id, data);

      showToast("Data Riwayat Kerja berhasil disimpan!", "success");
      setIsModalOpen(false);
      refreshProfil();
    } catch (error) {
      const err = error.response?.data;
      if (error.response?.status === 422)
        setFormErrors(err.error?.details || err.errors || {});
      else showToast(err?.message || "Terjadi kesalahan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await pegawaiRiwayatKerjaService.delete(pegawai.id, deleteModal.id);
      showToast("Data berhasil dihapus!", "success");
      setDeleteModal({ isOpen: false, id: null, name: "" });
      refreshProfil();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal menghapus.", "error");
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
        <h3 className="text-lg font-bold text-slate-800">Riwayat Kerja</h3>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-sm"
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
          Tambah Riwayat
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
              <th className="px-4 py-3 font-semibold">Unit Kerja / Instansi</th>
              <th className="px-4 py-3 font-semibold">Posisi</th>
              <th className="px-4 py-3 font-semibold">Tgl Mulai - Selesai</th>
              <th className="px-4 py-3 font-semibold text-center">Berkas</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listData.length > 0 ? (
              listData.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.unit_kerja}
                    <div className="text-xs text-slate-500">
                      {item.klasifikasi} | SK: {item.no_surat}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.posisi}</td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(item.tanggal_mulai)} <br /> s/d{" "}
                    {formatDate(item.tanggal_selesai)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.file_berkas ? (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${item.file_berkas}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-orange-100 transition-colors"
                      >
                        Lihat
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">-</span>
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
                            name: item.unit_kerja,
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
                <td colSpan="6" className="text-center py-6 text-slate-500">
                  Belum ada data
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
                {editingId ? "Edit Riwayat Kerja" : "Tambah Riwayat Kerja"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit Kerja / Instansi{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="unit_kerja"
                    value={formData.unit_kerja}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.unit_kerja ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                  />
                  {formErrors.unit_kerja && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.unit_kerja[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Klasifikasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="klasifikasi"
                      value={formData.klasifikasi}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm cursor-pointer"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Eksternal">Eksternal</option>
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="posisi"
                    value={formData.posisi}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.posisi ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    No. Surat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="no_surat"
                    value={formData.no_surat}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.no_surat ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.tanggal_mulai ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={formData.tanggal_selesai}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    File SK / Berkas
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFileBerkas(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
        title="Hapus Riwayat Kerja?"
        message={`Hapus data "${deleteModal.name}"?`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
