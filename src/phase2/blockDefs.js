import { night } from '../theme';

// Kategori blok di sidebar kiri. Warna diambil dari palet malam; ikon dan nama
// ikut membedakan kategori, jadi tidak bergantung pada warna saja.
export const CATEGORIES = [
  { id: 'event', label: 'Kejadian', icon: 'flag', color: night.mustard },
  { id: 'motion', label: 'Gerak', icon: 'navigate', color: night.blue },
  { id: 'control', label: 'Kontrol', icon: 'repeat', color: night.chalk },
  { id: 'variable', label: 'Variabel', icon: 'calculator', color: night.chalkDim },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/**
 * Definisi blok bergaya Scratch.
 * parts: { t } = teks biasa; { opts, d } = nilai yang bisa diganti (ketuk untuk mengganti),
 *        d = nilai bawaan.
 * hat: true = bentuk topi (awal skrip), tanpa takik di atas.
 * "ulangi" dan "jika" berlaku untuk blok TEPAT di bawahnya.
 */
export const BLOCK_DEFS = [
  { id: 'when_start', cat: 'event', hat: true, parts: [{ t: 'saat JALANKAN ditekan' }] },

  { id: 'move', cat: 'motion', parts: [{ t: 'maju' }, { opts: [1, 2, 3, 4, 5, 6, 7], d: 3 }, { t: 'langkah' }] },
  { id: 'turn_left', cat: 'motion', parts: [{ t: 'belok kiri' }, { opts: [90, 180], d: 90 }, { t: '°' }] },
  { id: 'turn_right', cat: 'motion', parts: [{ t: 'belok kanan' }, { opts: [90, 180], d: 90 }, { t: '°' }] },

  { id: 'repeat', cat: 'control', parts: [{ t: 'ulangi' }, { opts: [2, 3, 4, 5, 6, 7, 8], d: 4 }, { t: 'kali' }] },
  { id: 'if_obstacle', cat: 'control', parts: [{ t: 'jika ada rintangan di depan' }] },
  { id: 'wait', cat: 'control', parts: [{ t: 'tunggu' }, { opts: [1, 2, 3], d: 1 }, { t: 'detik' }] },

  { id: 'set_var', cat: 'variable', parts: [{ t: 'atur skor jadi' }, { opts: [0, 10, 50, 100], d: 0 }] },
  { id: 'change_var', cat: 'variable', parts: [{ t: 'ubah skor sebesar' }, { opts: [1, 5, 10, 20], d: 10 }] },
];

export const DEF_BY_ID = Object.fromEntries(BLOCK_DEFS.map((d) => [d.id, d]));

/** Nilai bawaan semua bagian yang bisa diganti pada sebuah blok. */
export const defaultVals = (def) => def.parts.filter((p) => p.opts).map((p) => p.d);

/** Label ringkas untuk chip palet. */
export const labelOf = (def, vals = defaultVals(def)) => {
  let k = 0;
  return def.parts.map((p) => (p.opts ? vals[k++] : p.t)).join(' ');
};
