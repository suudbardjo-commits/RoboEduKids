// Membuat lagu latar dan efek suara RoboEdu Kids sepenuhnya dari sintesis (tanpa sampel atau lagu orang lain),
// jadi bebas hak cipta dan ringan. Jalankan: node scripts/make-audio.js
const fs = require('fs');
const path = require('path');

const SR = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'audio');
fs.mkdirSync(OUT, { recursive: true });

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

function wave(type, ph) {
  const p = ph - Math.floor(ph);
  switch (type) {
    case 'square': return p < 0.5 ? 1 : -1;
    case 'pulse': return p < 0.25 ? 1 : -1;
    case 'tri': return 4 * Math.abs(p - 0.5) - 1;
    case 'saw': return 2 * p - 1;
    default: return Math.sin(TAU * p);
  }
}

class Track {
  constructor(seconds) {
    this.buf = new Float32Array(Math.ceil(seconds * SR));
  }
  /** Satu nada: gelombang, awal (detik), lama (detik), volume, peluruhan (makin besar makin cepat hilang). */
  tone({ f, t, d, v = 0.3, type = 'tri', decay = 3, slideTo = null }) {
    const n = Math.floor(d * SR);
    const start = Math.floor(t * SR);
    let ph = 0;
    for (let i = 0; i < n && start + i < this.buf.length; i++) {
      const x = i / n;
      const freq = slideTo ? f + (slideTo - f) * x : f;
      ph += freq / SR;
      const attack = Math.min(1, i / (0.006 * SR));
      const release = Math.min(1, (n - i) / (0.02 * SR));
      const env = attack * release * Math.exp(-decay * x);
      this.buf[start + i] += wave(type, ph) * v * env;
    }
  }
  noise({ t, d, v = 0.3, decay = 6 }) {
    const n = Math.floor(d * SR);
    const start = Math.floor(t * SR);
    let last = 0;
    for (let i = 0; i < n && start + i < this.buf.length; i++) {
      const x = i / n;
      last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
      this.buf[start + i] += last * v * Math.exp(-decay * x);
    }
  }
  save(name) {
    let peak = 0;
    for (const s of this.buf) peak = Math.max(peak, Math.abs(s));
    const gain = peak > 0 ? 0.85 / peak : 1;
    const fade = Math.floor(0.012 * SR);
    const data = Buffer.alloc(this.buf.length * 2);
    for (let i = 0; i < this.buf.length; i++) {
      let s = this.buf[i] * gain;
      if (i < fade) s *= i / fade;
      if (this.buf.length - i < fade) s *= (this.buf.length - i) / fade;
      data.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, i * 2);
    }
    const h = Buffer.alloc(44);
    h.write('RIFF', 0);
    h.writeUInt32LE(36 + data.length, 4);
    h.write('WAVEfmt ', 8);
    h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20);
    h.writeUInt16LE(1, 22);
    h.writeUInt32LE(SR, 24);
    h.writeUInt32LE(SR * 2, 28);
    h.writeUInt16LE(2, 32);
    h.writeUInt16LE(16, 34);
    h.write('data', 36);
    h.writeUInt32LE(data.length, 40);
    fs.writeFileSync(path.join(OUT, name), Buffer.concat([h, data]));
    console.log(name, (data.length / 1024).toFixed(0) + ' KB');
  }
}

// ---------- Lagu 1: "Jalan Pagi" (Beranda dan Fase 1), C mayor, 120 bpm, 16 detik, mulus diulang ----------
{
  const beat = 0.5;
  const t = new Track(16);
  const chords = [
    { bass: 48, tones: [60, 64, 67] }, // C
    { bass: 45, tones: [57, 60, 64] }, // Am
    { bass: 53, tones: [60, 65, 69] }, // F
    { bass: 43, tones: [59, 62, 67] }, // G
  ];
  const melody = [
    [76, 79, 76, 74],
    [72, 76, 81, 76],
    [77, 81, 79, 77],
    [74, 79, 76, 74],
    [79, 76, 74, 72],
    [76, 72, 74, 76],
    [77, 74, 72, 74],
    [71, 74, 79, 79],
  ];
  for (let bar = 0; bar < 8; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    t.tone({ f: mtof(c.bass), t: t0, d: beat * 1.9, v: 0.34, type: 'tri', decay: 1.2 });
    t.tone({ f: mtof(c.bass), t: t0 + 2 * beat, d: beat * 1.9, v: 0.3, type: 'tri', decay: 1.2 });
    for (let i = 0; i < 8; i++) {
      const m = c.tones[[0, 1, 2, 1, 0, 1, 2, 1][i]];
      t.tone({ f: mtof(m), t: t0 + i * beat / 2, d: beat / 2, v: 0.1, type: 'pulse', decay: 4 });
    }
    melody[bar].forEach((m, i) => {
      t.tone({ f: mtof(m), t: t0 + i * beat, d: beat * 0.92, v: 0.26, type: 'tri', decay: 1.8 });
      t.tone({ f: mtof(m) * 2, t: t0 + i * beat, d: beat * 0.5, v: 0.05, type: 'sine', decay: 4 });
    });
  }
  t.save('musik-pagi.wav');
}

// ---------- Lagu 2: "Buku Catatan Malam" (Fase 2), A minor, 84 bpm, ~22 detik ----------
{
  const beat = 60 / 84;
  const bars = 8;
  const t = new Track(bars * 4 * beat);
  const chords = [
    { bass: 45, tones: [57, 60, 64, 69] }, // Am
    { bass: 41, tones: [57, 60, 65, 69] }, // F
    { bass: 48, tones: [55, 60, 64, 67] }, // C
    { bass: 43, tones: [55, 59, 62, 67] }, // G
  ];
  for (let bar = 0; bar < bars; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    t.tone({ f: mtof(c.bass), t: t0, d: beat * 3.8, v: 0.32, type: 'sine', decay: 0.8 });
    for (let i = 0; i < 8; i++) {
      const m = c.tones[[0, 1, 2, 3, 2, 1, 2, 1][i]];
      t.tone({ f: mtof(m), t: t0 + i * beat / 2, d: beat * 0.7, v: 0.14, type: 'tri', decay: 3.5 });
    }
    // denting tinggi jarang-jarang
    if (bar % 2 === 1) {
      t.tone({ f: mtof(c.tones[3] + 12), t: t0 + 2.5 * beat, d: beat * 1.4, v: 0.1, type: 'sine', decay: 3 });
    }
  }
  t.save('musik-malam.wav');
}

// ---------- Efek suara ----------
function sfx(name, seconds, fn) {
  const t = new Track(seconds);
  fn(t);
  t.save(name);
}

sfx('sfx-ketuk.wav', 0.12, (t) => t.tone({ f: 620, slideTo: 900, t: 0, d: 0.1, v: 0.5, type: 'sine', decay: 4 }));

sfx('sfx-tambah.wav', 0.2, (t) => {
  t.tone({ f: mtof(72), t: 0, d: 0.08, v: 0.4, type: 'tri', decay: 3 });
  t.tone({ f: mtof(79), t: 0.07, d: 0.12, v: 0.4, type: 'tri', decay: 4 });
});

sfx('sfx-langkah.wav', 0.1, (t) => t.tone({ f: 300, slideTo: 220, t: 0, d: 0.08, v: 0.45, type: 'square', decay: 5 }));

sfx('sfx-tabrak.wav', 0.3, (t) => {
  t.noise({ t: 0, d: 0.18, v: 0.5, decay: 7 });
  t.tone({ f: 130, slideTo: 70, t: 0, d: 0.25, v: 0.6, type: 'sine', decay: 5 });
});

sfx('sfx-menang.wav', 1.3, (t) => {
  [72, 76, 79, 84].forEach((m, i) => t.tone({ f: mtof(m), t: i * 0.16, d: 0.26, v: 0.38, type: 'tri', decay: 2.5 }));
  [88, 91, 96].forEach((m, i) => t.tone({ f: mtof(m), t: 0.7 + i * 0.12, d: 0.4, v: 0.18, type: 'sine', decay: 3 }));
  t.tone({ f: mtof(72), t: 0.64, d: 0.6, v: 0.25, type: 'tri', decay: 2 });
  t.tone({ f: mtof(79), t: 0.64, d: 0.6, v: 0.2, type: 'tri', decay: 2 });
});

sfx('sfx-gagal.wav', 1, (t) => {
  [67, 64, 60].forEach((m, i) => t.tone({ f: mtof(m), t: i * 0.24, d: 0.3, v: 0.4, type: 'tri', decay: 2.5 }));
});

sfx('sfx-robo.wav', 0.25, (t) => {
  t.tone({ f: 380, slideTo: 760, t: 0, d: 0.12, v: 0.45, type: 'square', decay: 3 });
  t.tone({ f: 760, slideTo: 520, t: 0.11, d: 0.12, v: 0.4, type: 'square', decay: 4 });
});
