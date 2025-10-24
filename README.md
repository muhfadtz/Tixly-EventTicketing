# Tixly - QR Ticketing Platform

Tixly adalah aplikasi web event ticketing _Minimum Viable Product_ (MVP) yang dibangun dengan React dan Firebase. Aplikasi ini memungkinkan pengguna untuk mendaftar acara, melihat tiket mereka dengan kode QR, dan memungkinkan panitia untuk memindai dan memvalidasi tiket-tiket ini untuk proses check-in.

## Fitur Utama

### Untuk Peserta
- **Jelajahi Acara**: Lihat daftar semua acara yang akan datang dan telah dipublikasikan.
- **Pencarian Real-time**: Filter acara secara instan berdasarkan nama atau lokasi.
- **Detail Acara**: Lihat informasi terperinci tentang setiap acara, termasuk tanggal, lokasi, harga, dan deskripsi.
- **Registrasi Pengguna**: Mendaftar dan masuk sebagai peserta.
- **Pendaftaran Acara**: Mendaftar untuk acara dan menerima tiket digital.
- **Tiket Saya**: Mengakses semua tiket yang telah terdaftar dalam satu halaman.
- **Tiket Kode QR**: Setiap tiket dilengkapi dengan kode QR unik yang dapat diunduh untuk check-in.

### Untuk Panitia (Organizer)
- **Otentikasi Panitia**: Mendaftar dan masuk dengan peran sebagai panitia.
- **Dashboard Acara**: Mengelola semua acara yang dibuat dalam satu dashboard terpusat, dipisahkan antara acara yang dipublikasikan dan draft.
- **Manajemen Acara (CRUD)**:
    - **Buat**: Membuat acara baru dengan detail lengkap.
    - **Edit**: Memperbarui informasi acara yang sudah ada.
    - **Hapus**: Menghapus acara (dengan dialog konfirmasi).
- **Publikasi Acara**: Mengontrol visibilitas acara dengan mempublikasikan atau menyembunyikannya (unpublish).
- **Lihat Peserta**: Melihat daftar semua peserta yang telah terdaftar untuk setiap acara.
- **Pemindai Kode QR**: Menggunakan kamera perangkat untuk memindai kode QR tiket, memvalidasi statusnya, dan melakukan check-in peserta.

### Fitur Umum
- **Desain Responsif**: Antarmuka pengguna yang dioptimalkan untuk perangkat desktop dan seluler.
- **Mode Terang & Gelap**: Beralih antara tema terang dan gelap untuk kenyamanan visual.
- **Modal Kustom**: Dialog notifikasi (`alert`) dan konfirmasi (`confirm`) yang modern dan konsisten di seluruh aplikasi, menggantikan dialog bawaan browser.
- **State Pemuatan (Loading States)**: Indikator pemuatan yang jelas di seluruh aplikasi untuk memberikan umpan balik selama operasi data.
- **Rute Terproteksi**: Kontrol akses berbasis peran untuk memastikan hanya pengguna yang berwenang yang dapat mengakses halaman tertentu (misalnya, dashboard panitia, halaman tiket saya).

## Tumpukan Teknologi

- **Frontend**:
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**:
  - [Firebase](https://firebase.google.com/)
    - **Authentication**: Untuk otentikasi pengguna berbasis email & kata sandi.
    - **Firestore**: Sebagai database NoSQL untuk menyimpan data pengguna, acara, dan tiket.
- **Routing**:
  - [React Router](https://reactrouter.com/)
- **Utilitas**:
  - **Pemindaian Kode QR**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
  - **Pembuatan Kode QR**: [qrcode.react](https://github.com/zpao/qrcode.react)
  - **Ikon**: [Lucide Icons](https://lucide.dev/)

## Struktur Proyek

```
/
├── public/
├── src/
│   ├── components/      # Komponen UI yang dapat digunakan kembali (Layout, Spinner, Modal)
│   ├── contexts/        # React Context untuk state global (Auth, Theme, Modal)
│   ├── pages/           # Komponen level atas untuk setiap rute/halaman
│   ├── services/        # Konfigurasi dan inisialisasi Firebase
│   ├── App.tsx          # Konfigurasi rute utama aplikasi
│   ├── index.tsx        # Titik masuk aplikasi React
│   └── types.ts         # Definisi tipe TypeScript untuk model data
├── index.html           # File HTML utama
└── README.md            # Dokumentasi ini
```

## Setup & Instalasi Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### 1. Prasyarat
- Node.js (v14 atau lebih baru)
- npm atau yarn

### 2. Konfigurasi Firebase
1.  Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
2.  Di dalam proyek Anda, aktifkan layanan berikut:
    - **Authentication**: Aktifkan metode masuk **Email/Password**.
    - **Firestore Database**: Buat database baru dalam mode produksi.
3.  Di **Project Settings**, klik **Add app** dan pilih **Web** (`</>`).
4.  Salin objek konfigurasi Firebase (Firebase config object).

### 3. Instalasi Proyek
1.  **Clone repositori ini:**
    ```bash
    git clone <URL_REPOSITORI>
    cd <NAMA_DIREKTORI>
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Kredensial Firebase:**
    - Buka file `src/services/firebase.ts`.
    - Ganti objek `firebaseConfig` placeholder dengan objek konfigurasi yang Anda salin dari Firebase console.

    ```typescript
    // src/services/firebase.ts

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID" // Opsional
    };
    ```

4.  **Menjalankan Aplikasi:**
    ```bash
    npm start
    ```
    Aplikasi sekarang akan berjalan di `http://localhost:3000` (atau port lain yang tersedia).

### 4. Struktur Database Firestore
Aplikasi ini menggunakan tiga koleksi utama di Firestore:

- `users`: Menyimpan informasi pengguna.
  - Dokumen: `{ uid, email, namaLengkap, role: 'peserta' | 'panitia' }`
- `events`: Menyimpan detail acara.
  - Dokumen: `{ namaAcara, tanggal, lokasi, harga, deskripsiSingkat, organizerId, isPublished }`
- `tickets`: Menyimpan data tiket yang terhubung dengan pengguna dan acara.
  - Dokumen: `{ eventId, userId, namaPeserta, emailPeserta, status: 'paid' | 'used', qrCodeString, createdAt }`
