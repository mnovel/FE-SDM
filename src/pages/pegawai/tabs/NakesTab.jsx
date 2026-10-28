import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { pegawaiNakesService } from "../../../services/pegawai/pegawaiNakesService";
import Toast from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function NakesTab() {
  const { pegawai, refreshProfil } = useOutletContext();
  const pegawaiId = pegawai.id;
  const listNakes = pegawai.nakes || [];

  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    profesi: "",
    no_str: "",
    tgl_berakhir_str: "",
    no_sip: "",
    tgl_berakhir_sip: "",
    no_sik: "",
  });
  const [fileStr, setFileStr] = useState(null);
  const [fileSip, setFileSip] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "error") => setToast({ message, type });
  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  const openModal = (item = null) => {
    setFormErrors({});
    setFileStr(null);
    setFileSip(null);
    if (item) {
      setEditingId(item.id);
      setFormData({
        profesi: item.profesi || "",
        no_str: item.no_str || "",
        tgl_berakhir_str: item.tgl_berakhir_str
          ? item.tgl_berakhir_str.split("T")[0]
          : "",
        no_sip: item.no_sip || "",
        tgl_berakhir_sip: item.tgl_berakhir_sip
          ? item.tgl_berakhir_sip.split("T")[0]
          : "",
        no_sik: item.no_sik || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        profesi: "",
        no_str: "",
        tgl_berakhir_str: "",
        no_sip: "",
        tgl_berakhir_sip: "",
        no_sik: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
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
      if (formData[key] !== "") data.append(key, formData[key]);
    });
    if (fileStr) data.append("file_str", fileStr);
    if (fileSip) data.append("file_sip", fileSip);

    try {
      if (editingId)
        await pegawaiNakesService.update(pegawaiId, editingId, data);
      else await pegawaiNakesService.create(pegawaiId, data);
      showToast("Data Nakes berhasil disimpan!", "success");
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
      await pegawaiNakesService.delete(pegawaiId, deleteModal.id);
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
        <h3 className="text-lg font-bold text-slate-800">
          Informasi Tenaga Kesehatan
        </h3>
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
          Tambah Data Nakes
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
              <th className="px-4 py-3 font-semibold">Profesi</th>
              <th className="px-4 py-3 font-semibold">STR</th>
              <th className="px-4 py-3 font-semibold">SIP</th>
              <th className="px-4 py-3 font-semibold">SIK</th>
              <th className="px-4 py-3 font-semibold text-center">Berkas</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listNakes.length > 0 ? (
              listNakes.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.profesi}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.no_str}</p>
                    <p className="text-xs text-slate-500">
                      s/d {formatDate(item.tgl_berakhir_str)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.no_sip || "-"}</p>
                    <p className="text-xs text-slate-500">
                      {item.tgl_berakhir_sip
                        ? `s/d ${formatDate(item.tgl_berakhir_sip)}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{item.no_sik || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {item.file_str && (
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${item.file_str}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-orange-600 bg-orange-50 rounded hover:bg-orange-100"
                          title="Lihat STR"
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </a>
                      )}
                      {item.file_sip && (
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/storage/${item.file_sip}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                          title="Lihat SIP"
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
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
                            name: item.profesi,
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
                  Belum ada data Nakes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM NAKES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Data Nakes" : "Tambah Data Nakes"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Profesi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="profesi"
                    value={formData.profesi}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.profesi ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Contoh: Dokter Spesialis Penyakit Dalam"
                  />
                  {formErrors.profesi && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.profesi[0]}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-orange-500 mb-3">
                    Surat Tanda Registrasi (STR)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        No. STR <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="no_str"
                        value={formData.no_str}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm focus:ring-2 focus:outline-none transition-all ${formErrors.no_str ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"}`}
                      />
                      {formErrors.no_str && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.no_str[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Berlaku s/d <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="tgl_berakhir_str"
                        value={formData.tgl_berakhir_str}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm focus:ring-2 focus:outline-none transition-all ${formErrors.tgl_berakhir_str ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"}`}
                      />
                      {formErrors.tgl_berakhir_str && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.tgl_berakhir_str[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        File STR (PDF/Gambar)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFileStr(e.target.files[0])}
                        className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-orange-500 mb-3">
                    Surat Izin Praktik (SIP)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        No. SIP
                      </label>
                      <input
                        type="text"
                        name="no_sip"
                        value={formData.no_sip}
                        onChange={handleChange}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm focus:ring-2 focus:outline-none transition-all ${formErrors.no_sip ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"}`}
                      />
                      {formErrors.no_sip && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.no_sip[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Berlaku s/d
                      </label>
                      <input
                        type="date"
                        name="tgl_berakhir_sip"
                        value={formData.tgl_berakhir_sip}
                        onChange={handleChange}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm focus:ring-2 focus:outline-none transition-all ${formErrors.tgl_berakhir_sip ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"}`}
                      />
                      {formErrors.tgl_berakhir_sip && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.tgl_berakhir_sip[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        File SIP (PDF/Gambar)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFileSip(e.target.files[0])}
                        className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    No. SIK (Surat Izin Kerja)
                  </label>
                  <input
                    type="text"
                    name="no_sik"
                    value={formData.no_sik}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.no_sik ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Opsional"
                  />
                  {formErrors.no_sik && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.no_sik[0]}
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus Data Nakes?"
        message={`Apakah Anda yakin ingin menghapus data nakes untuk profesi "${deleteModal.name}"?`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
