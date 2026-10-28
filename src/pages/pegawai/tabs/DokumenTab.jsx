import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { pegawaiDokumenService } from "../../../services/pegawai/pegawaiDokumenService";
import Toast from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

const JENIS_DOKUMEN_OPTIONS = [
  "KTP",
  "Kartu Keluarga (KK)",
  "NPWP",
  "Ijazah",
  "Transkrip Nilai",
  "SK CPNS",
  "SK PNS",
  "Karis/Karsu",
  "Sertifikat",
  "Lainnya",
];

export default function DokumenTab() {
  const { pegawai, refreshProfil } = useOutletContext();
  const pegawaiId = pegawai.id;
  const listDokumen = pegawai.dokumen || [];

  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    jenis_dokumen: "KTP",
    nomor_dokumen: "",
    tanggal_kadaluarsa: "",
  });
  const [fileDokumen, setFileDokumen] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    title: "",
    type: "",
  });

  const showToast = (message, type = "error") => setToast({ message, type });
  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  const handlePreview = (item) => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    baseUrl = baseUrl.replace(/\/api\/?$/, "");
    const fileUrl = `${baseUrl}/storage/${item.file_path}`;

    const ext = item.file_path.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png"].includes(ext);

    setPreviewModal({
      isOpen: true,
      url: fileUrl,
      title: item.jenis_dokumen,
      type: isImage ? "image" : "pdf",
    });
  };

  const openModal = (item = null) => {
    setFormErrors({});
    setFileDokumen(null);
    if (item) {
      setEditingId(item.id);
      setFormData({
        jenis_dokumen: item.jenis_dokumen || "KTP",
        nomor_dokumen: item.nomor_dokumen || "",
        tanggal_kadaluarsa: item.tanggal_kadaluarsa
          ? item.tanggal_kadaluarsa.split("T")[0]
          : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        jenis_dokumen: "KTP",
        nomor_dokumen: "",
        tanggal_kadaluarsa: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // PERBAIKAN: Fungsi handleFileChange yang sempat hilang
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileDokumen(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "") data.append(key, formData[key]);
    });
    if (fileDokumen) data.append("file_path", fileDokumen);

    try {
      if (editingId)
        await pegawaiDokumenService.update(pegawaiId, editingId, data);
      else await pegawaiDokumenService.create(pegawaiId, data);
      showToast("Dokumen berhasil disimpan!", "success");
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
      await pegawaiDokumenService.delete(pegawaiId, deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      refreshProfil();
      showToast("Dokumen berhasil dihapus!", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menghapus dokumen.",
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
        <h3 className="text-lg font-bold text-slate-800">Dokumen Pegawai</h3>
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>{" "}
          Upload Dokumen
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
              <th className="px-4 py-3 font-semibold">Jenis Dokumen</th>
              <th className="px-4 py-3 font-semibold">Nomor Dokumen</th>
              <th className="px-4 py-3 font-semibold">Tgl Kadaluarsa</th>
              <th className="px-4 py-3 font-semibold text-center">File</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listDokumen.length > 0 ? (
              listDokumen.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.jenis_dokumen}
                  </td>
                  <td className="px-4 py-3">{item.nomor_dokumen || "-"}</td>
                  <td className="px-4 py-3">
                    {formatDate(item.tanggal_kadaluarsa)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.file_path ? (
                      <button
                        onClick={() => handlePreview(item)}
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
                      </button>
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
                            name: item.jenis_dokumen,
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
                  Belum ada dokumen yang diunggah
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM DOKUMEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Dokumen" : "Upload Dokumen Baru"}
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
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Jenis Dokumen <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="jenis_dokumen"
                      value={formData.jenis_dokumen}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm cursor-pointer"
                    >
                      {JENIS_DOKUMEN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
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
                  {formErrors.jenis_dokumen && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.jenis_dokumen[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nomor Dokumen
                  </label>
                  <input
                    type="text"
                    name="nomor_dokumen"
                    value={formData.nomor_dokumen}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.nomor_dokumen ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Opsional"
                  />
                  {formErrors.nomor_dokumen && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.nomor_dokumen[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    name="tanggal_kadaluarsa"
                    value={formData.tanggal_kadaluarsa}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.tanggal_kadaluarsa ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                  />
                  {formErrors.tanggal_kadaluarsa && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.tanggal_kadaluarsa[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    File Dokumen{" "}
                    {editingId ? "" : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required={!editingId}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Format: PDF/JPG/PNG. Maks: 5MB.
                    {editingId && (
                      <span className="text-orange-500 block mt-0.5">
                        *Biarkan kosong jika tidak ingin mengubah file lama.
                      </span>
                    )}
                  </p>
                  {formErrors.file_path && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.file_path[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  {isSubmitting ? "Mengunggah..." : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FILE (PDF / GAMBAR) */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                Preview: {previewModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors flex items-center gap-1"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>{" "}
                  Buka Tab Baru
                </a>
                <button
                  onClick={() =>
                    setPreviewModal({ ...previewModal, isOpen: false })
                  }
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
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
            </div>

            <div className="flex-1 bg-slate-100 rounded-b-2xl overflow-hidden p-2">
              {previewModal.type === "image" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={previewModal.url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              ) : (
                <iframe
                  src={`${previewModal.url}#toolbar=0`}
                  className="w-full h-full rounded-lg border-0 bg-white"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus Dokumen?"
        message={`Apabila Anda menghapus dokumen "${deleteModal.name}", file fisik di server juga akan terhapus. Lanjutkan?`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
