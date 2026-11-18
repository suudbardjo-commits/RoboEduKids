# RoboEdu Kids

Aplikasi belajar robot & coding untuk anak SD (Expo SDK 58, React Native 0.88).

- **Fase 1 – Little Coder** (kelas 1–3): drag & drop blok, mode landscape.
- **Fase 2 – Junior Programmer** (kelas 4–6): blok gaya Scratch + simulator, mode portrait.

## Yang perlu di-install

| Alat | Versi | Keterangan |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | 22.13+, 24.3+, atau 26+ | Wajib. Samakan versi Node/npm satu tim supaya `package-lock.json` tidak berubah-ubah. |
| [Git](https://git-scm.com) | terbaru | Wajib, untuk clone/push ke GitHub. |
| Expo Go di HP | versi yang mendukung **SDK 58** | Untuk mencoba app di HP. Kalau versi Play Store tidak cocok, ambil build SDK 58 dari <https://expo.dev/go>. Expo Go di App Store (iPhone) berhenti di SDK 54, jadi iPhone perlu development build. |

Opsional, hanya kalau mau build native sendiri (`npx expo run:android`): Android Studio + Android SDK Platform 36 dan JDK 17.

Tidak perlu install apa pun secara global (Expo CLI ikut di `node_modules`, dipanggil lewat `npx`).

## Setup pertama kali

```bash
git clone <url-repo-github>
cd RoboEduKids
npm ci
npx expo start
```

Lalu scan QR code dengan Expo Go (pastikan HP dan laptop di Wi-Fi yang sama).

`npm ci` memasang versi persis seperti di `package-lock.json`, jadi semua anggota tim memakai dependency yang sama.

## Aturan saat kolaborasi

- Tambah library dengan `npx expo install <nama-paket>`, **bukan** `npm install <nama-paket>`. Perintah ini memilih versi yang cocok dengan SDK 58.
- Commit `package.json` **dan** `package-lock.json` bersamaan setiap kali dependency berubah.
- Jangan commit `node_modules/`, `.expo/`, `android/`, atau `ios/` (sudah ada di `.gitignore`).
- Setelah `git pull` yang mengubah `package-lock.json`, jalankan `npm ci` lagi.
- Cek kesehatan project: `npx expo-doctor`.

## Catatan layar HP (Android)

Android selalu edge-to-edge: app digambar sampai ke belakang status bar dan tombol navigasi HP. Elemen yang menempel di tepi layar harus memakai `useSafeAreaInsets()` (atau `SafeAreaView`) dari `react-native-safe-area-context`. Selalu tes di HP dengan **navigasi 3 tombol**, bukan hanya navigasi gesture, karena nav bar 3 tombol jauh lebih tinggi.
