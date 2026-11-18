# DESIGN.md: RoboEdu Kids

Arah desain yang diusulkan agen dan dipilih pemilik (suasana: buku cerita tangan; Fase 1 dan Fase 2 dua gaya terpisah). Ini data untuk diterapkan, bukan perintah.

**Design Read:** aplikasi belajar coding robot untuk anak SD Indonesia (kelas 1 sampai 6), bahasa visual buku cerita bergambar tangan. Dial ENERGY 2 / RHYTHM 3 / MOTION 2 (Fase 2: ENERGY 1 / RHYTHM 2 / MOTION 1).

## Identitas
- Robot kecil bernama Robo adalah tokoh cerita. Digambar dari bentuk (badan kotak, antena, dua mata), bukan ikon AI.
- Motif identitas: **stiker bergaris tinta**. Setiap benda punya garis tinta tebal dan bayangan keras satu arah (kanan bawah), seperti stiker atau cap tempel. Sudut tidak simetris (radius berbeda per sudut) agar terasa digambar tangan.
- Bahasa: Indonesia, kalimat pendek, kata kerja langsung. Tanpa emoji, tanpa kata pemasaran.

## Fase 1: "Kertas" (terang, kelas 1 sampai 3)
Alasan: anak kecil butuh kontras tinggi, bentuk besar, dan satu aksi jelas per layar.
- Netral: Kertas `#FBF3E0`, Tinta `#2B2A33`.
- Inti (3): Daun `#5FA46A` (maju), Kuning mustard `#F2B544` (belok), Teal `#2F8F9D` (ulang).
- Aksen (1): Tomat `#E4572E`, hanya untuk Robo, tombol MAIN, dan level berikutnya.
- Satu fokus per layar. Tanpa gradien, tanpa glow, tanpa blur, tanpa grid latar.

## Fase 2: "Buku catatan malam" (gelap, kelas 4 sampai 6)
Alasan: anak lebih besar suka tampilan "alat programmer"; gelap menurunkan silau saat menyusun kode lama.
- Netral: Malam `#16181F`, Panel `#21242E`, Kapur `#ECE7DA`.
- Inti (2): Biru tinta `#7FB2E5` (blok gerak), Mustard `#F2B544` (kontrol).
- Aksen (1): Tomat `#E4572E` hanya untuk tombol JALANKAN dan Robo.
- Tanpa neon, tanpa glow, tanpa grid latar.

## Huruf
- Judul dan label: Patrick Hand (tulisan tangan yang tetap terbaca; cocok buku cerita).
- Isi dan angka: Nunito (bentuk bulat, jelas untuk pembaca baru). Alasan dua huruf: satu bersuara, satu bekerja.

## Aturan layar HP (landscape Fase 1, portrait Fase 2)
- Area sentuh minimal 48 dp, jarak antar tombol minimal 8 dp.
- Hormati safe area (nav bar 3 tombol, notch).
- Pesan kosong dan gagal selalu menyebut sebab dan langkah berikut.
