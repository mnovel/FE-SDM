// src/config/menuConfig.js

export const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    name: "Mutasi Jabatan",
    path: "/kepegawaian/mutasi",
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  },
  {
    name: "Data Pegawai",
    path: "/pegawai",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    name: "Jadwal",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    children: [{ name: "Libur", path: "/jadwal/libur" }],
  },
  {
    name: "Master Data",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    children: [
      { name: "Suku", path: "/master/suku" },
      { name: "Agama", path: "/master/agama" },
      { name: "Bahasa", path: "/master/bahasa" },
      { name: "Pendidikan", path: "/master/pendidikan" },
      { name: "Pangkat", path: "/master/pangkat" },
      { name: "Unit", path: "/master/unit" },
      { name: "Jabatan", path: "/master/jabatan" },
      { name: "Status Pegawai", path: "/master/status-pegawai" },
      { name: "Status Pernikahan", path: "/master/status-pernikahan" },
    ],
  },
];
