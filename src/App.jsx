import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- MASTER DATA ---
import MasterAgamaPage from './pages/masterdata/MasterAgamaPage';
import MasterSukuPage from './pages/masterdata/MasterSukuPage';
import MasterBahasaPage from './pages/masterdata/MasterBahasaPage';
import MasterPendidikanPage from './pages/masterdata/MasterPendidikanPage';
import MasterPangkatPage from './pages/masterdata/MasterPangkatPage';
import MasterUnitPage from './pages/masterdata/MasterUnitPage';
import MasterJabatanPage from './pages/masterdata/MasterJabatanPage';
import MasterStatusPegawaiPage from './pages/masterdata/MasterStatusPegawaiPage';
import MasterStatusPernikahanPage from './pages/masterdata/MasterStatusPernikahanPage';

// --- JADWAL ---
import LiburPage from './pages/jadwal/LiburPage';

// --- PEGAWAI ---
import PegawaiListPage from './pages/pegawai/PegawaiListPage';
import PegawaiFormPage from './pages/pegawai/PegawaiFormPage';
import PegawaiDetailLayout from './pages/pegawai/PegawaiDetailLayout';

// Sub-halaman di dalam Tab Pegawai
import ProfilUtamaTab from './pages/pegawai/tabs/ProfilUtamaTab';
import KepegawaianTab from './pages/pegawai/tabs/KepegawaianTab';
import KeluargaTab from './pages/pegawai/tabs/KeluargaTab';
import PendidikanTab from './pages/pegawai/tabs/PendidikanTab';
import NakesTab from './pages/pegawai/tabs/NakesTab';
import RekeningTab from './pages/pegawai/tabs/RekeningTab';
import DokumenTab from './pages/pegawai/tabs/DokumenTab';

// Perbaikan 1: Menerima props dengan benar dan memperbaiki interpolasi string
function DummyPage({ titlePage }) {
  return <div className="p-8">Halaman {titlePage} (Dalam pengembangan)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/profil" element={<DummyPage titlePage="Profile" />} />

          {/* --- ROUTE PEGAWAI --- */}
          {/* 1. List Pegawai */}
          <Route path="/pegawai" element={<PegawaiListPage />} />

          {/* 2. Tambah & Edit Pegawai */}
          <Route path="/pegawai/create" element={<PegawaiFormPage />} />
          <Route path="/pegawai/:id/edit" element={<PegawaiFormPage />} />

          {/* 3. Detail Pegawai (Menggunakan Layout dengan Tabs) */}
          <Route path="/pegawai/:id" element={<PegawaiDetailLayout />}>
            {/* Index route: otomatis tampil saat buka /pegawai/:id */}
            <Route index element={<ProfilUtamaTab />} />
            <Route path="kepegawaian" element={<KepegawaianTab />} />
            <Route path="keluarga" element={<KeluargaTab />} />
            <Route path="pendidikan" element={<PendidikanTab />} />
            <Route path="nakes" element={<NakesTab />} />
            <Route path="rekening" element={<RekeningTab />} />
            <Route path="dokumen" element={<DokumenTab />} />
          </Route>

          {/* --- MASTER ROUTE --- */}
          <Route path="/master/suku" element={<MasterSukuPage />} />
          <Route path="/master/agama" element={<MasterAgamaPage />} />
          <Route path="/master/bahasa" element={<MasterBahasaPage />} />
          <Route path="/master/pendidikan" element={<MasterPendidikanPage />} />
          <Route path="/master/pangkat" element={<MasterPangkatPage />} />
          <Route path="/master/unit" element={<MasterUnitPage />} />
          <Route path="/master/jabatan" element={<MasterJabatanPage />} />
          <Route path="/master/status-pegawai" element={<MasterStatusPegawaiPage />} />
          <Route path="/master/status-pernikahan" element={<MasterStatusPernikahanPage />} />

          {/* --- JADWAL ROUTE --- */}
          <Route path="/jadwal/libur" element={<LiburPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}