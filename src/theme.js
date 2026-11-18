// Token desain. Alasan tiap pilihan ada di DESIGN.md.

// Fase 1 "Kertas": terang, kontras tinggi untuk kelas 1-3.
export const paper = {
  paper: '#FBF3E0', // latar: kertas hangat, bukan putih steril
  paperDeep: '#F1E3C2', // area cekung (kanvas, tray)
  ink: '#2B2A33', // garis dan teks
  leaf: '#5FA46A', // blok maju
  mustard: '#F2B544', // blok belok
  teal: '#2F8F9D', // blok ulang
  tomato: '#E4572E', // aksen: Robo, tombol MAIN, level berikutnya
  white: '#FFFFFF',
};

// Fase 2 "Buku catatan malam": gelap, untuk kelas 4-6.
export const night = {
  bg: '#16181F',
  panel: '#21242E',
  panelHi: '#2C303C',
  chalk: '#ECE7DA',
  chalkDim: '#A9A596',
  blue: '#7FB2E5',
  mustard: '#F2B544',
  tomato: '#E4572E',
};

export const fonts = {
  hand: 'PatrickHand_400Regular', // judul dan label: tulisan tangan yang tetap terbaca
  body: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
};

/** Radius tak simetris supaya bentuk terasa digambar tangan. k memilih variasi 0-3. */
const WOB = [
  [1, 0.72, 1.12, 0.84],
  [0.8, 1.1, 0.74, 1],
  [1.1, 0.8, 0.9, 0.7],
  [0.74, 1, 0.82, 1.14],
];
export function wob(r, k = 0) {
  const m = WOB[((k % 4) + 4) % 4];
  return {
    borderTopLeftRadius: r * m[0],
    borderTopRightRadius: r * m[1],
    borderBottomRightRadius: r * m[2],
    borderBottomLeftRadius: r * m[3],
  };
}
