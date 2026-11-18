import { paper } from '../theme';

// Katalog blok perintah Fase 1. Warna membedakan jenis gerak (alasan di DESIGN.md);
// ikon + kata pendek membuat anak yang baru belajar membaca tetap paham.
export const BLOCKS = [
  { id: 'forward', label: 'Maju', icon: 'arrow-up', color: paper.leaf },
  { id: 'left', label: 'Kiri', icon: 'arrow-undo', color: paper.mustard },
  { id: 'right', label: 'Kanan', icon: 'arrow-redo', color: paper.mustard },
  { id: 'loop', label: 'Ulang', icon: 'repeat', color: paper.teal },
];

export const BLOCK_INDEX = Object.fromEntries(BLOCKS.map((b, i) => [b.id, i]));

export const MAX_BLOCKS = 24;
export const LEVEL_COUNT = 12;
