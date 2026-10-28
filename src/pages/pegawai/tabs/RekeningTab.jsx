import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { pegawaiRekeningService } from "../../../services/pegawai/pegawaiRekeningService";
import Toast from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

const BANK_OPTIONS = ["BNI", "Mandiri", "BTN", "BRI", "Bank Jatim"];

export default function RekeningTab() {
  const { pegawai, refreshProfil } = useOutletContext();
  const pegawaiId = pegawai.id;
  const listRekening = pegawai.rekening || [];

  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    nama_bank: "Bank Jatim",
    no_rekening: "",
    atas_nama: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "error") => setToast({ message, type });

  const openModal = (item = null) => {
    setFormErrors({});
    if (item) {
      setEditingId(item.id);
      setFormData({
        nama_bank: item.nama_bank || "Bank Jatim",
        no_rekening: item.no_rekening || "",
        atas_nama: item.atas_nama || "",
      });
    } else {
      setEditingId(null);
      setFormData({ nama_bank: "Bank Jatim", no_rekening: "", atas_nama: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "no_rekening") {
      newValue = value.replace(/\D/g, "");
      if (newValue.length > 30) newValue = newValue.slice(0, 30);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    try {
      if (editingId)
        await pegawaiRekeningService.update(pegawaiId, editingId, formData);
      else await pegawaiRekeningService.create(pegawaiId, formData);
      showToast("Data rekening berhasil disimpan!", "success");
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
      await pegawaiRekeningService.delete(pegawaiId, deleteModal.id);
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
          Informasi Rekening Bank
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
          Tambah Rekening
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold w-10 text-center">No</th>
              <th className="px-4 py-3 font-semibold">Nama Bank</th>
              <th className="px-4 py-3 font-semibold">Nomor Rekening</th>
              <th className="px-4 py-3 font-semibold">Atas Nama</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listRekening.length > 0 ? (
              listRekening.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>{" "}
                      {item.nama_bank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold tracking-wider text-slate-700">
                    {item.no_rekening}
                  </td>
                  <td className="px-4 py-3">{item.atas_nama}</td>
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
                            name: `${item.nama_bank} - ${item.no_rekening}`,
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
                <td colSpan="5" className="text-center py-6 text-slate-500">
                  Belum ada data rekening bank
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Rekening" : "Tambah Rekening"}
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
                    Nama Bank <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="nama_bank"
                      value={formData.nama_bank}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white outline-none transition-all text-sm cursor-pointer"
                    >
                      {BANK_OPTIONS.map((opt) => (
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nomor Rekening <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="no_rekening"
                    value={formData.no_rekening}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={30}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm font-mono tracking-wider ${formErrors.no_rekening ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Contoh: 1234567890"
                  />
                  {formErrors.no_rekening && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.no_rekening[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Atas Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="atas_nama"
                    value={formData.atas_nama}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${formErrors.atas_nama ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white"}`}
                    placeholder="Sesuai buku tabungan"
                  />
                  {formErrors.atas_nama && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.atas_nama[0]}
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
        title="Hapus Data Rekening?"
        message={`Apakah Anda yakin ingin menghapus rekening "${deleteModal.name}"?`}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
