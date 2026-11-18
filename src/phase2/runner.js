import { usePhase2Store } from './store';
import { MISSIONS } from './missions';
import { runProgram } from './interpreter';
import { initialRobot } from '../engine/grid';
import { playSfx } from '../audio';

let timer = null;
const get = () => usePhase2Store.getState();
const patch = (o) => usePhase2Store.getState().patch(o);

/** Seberapa dekat robot ke bendera (jarak Manhattan), 0..100. */
const progressOf = (m, r) => {
  const d0 = Math.abs(m.start.x - m.goal.x) + Math.abs(m.start.y - m.goal.y) || 1;
  const d = Math.abs(r.x - m.goal.x) + Math.abs(r.y - m.goal.y);
  return Math.max(0, Math.min(100, Math.round(100 * (1 - d / d0))));
};

export function stopRun() {
  clearTimeout(timer);
  timer = null;
}

/** Kembalikan robot ke awal misi (kode tidak berubah). */
export function resetWorld() {
  stopRun();
  patch({
    robot: initialRobot(MISSIONS[get().mission]),
    runningUid: null,
    status: 'idle',
    message: '',
    score: 0,
    progress: 0,
  });
}

/** Jalankan kode pada misi aktif dan animasikan langkah demi langkah. */
export function startRun() {
  stopRun();
  const { mission: mi, blocks } = get();
  const m = MISSIONS[mi];
  const res = runProgram(m, blocks);

  patch({ robot: initialRobot(m), runningUid: null, score: 0, progress: 0 });
  if (res.error) {
    patch({ status: 'error', message: 'Tambahkan blok "saat JALANKAN ditekan" dulu, lalu susun kodenya.' });
    return;
  }
  patch({ status: 'running', message: '' });

  let i = 0;
  const tick = () => {
    if (i >= res.steps.length) {
      if (res.won) {
        const total = res.score + 100;
        const best = get().best;
        patch({
          status: 'win',
          runningUid: null,
          score: total,
          progress: 100,
          message: `Berhasil! +100 poin bonus`,
          best: { ...best, [mi]: Math.max(best[mi] || 0, total) },
        });
        playSfx('menang');
      } else {
        playSfx('gagal', 0.7);
        patch({
          status: 'fail',
          runningUid: null,
          message: res.steps.length ? 'Robot belum sampai bendera. Ubah kodenya!' : 'Kodenya masih kosong. Tambahkan blok gerak!',
        });
      }
      return;
    }
    const st = res.steps[i];
    i += 1;
    playSfx(st.bump ? 'tabrak' : 'langkah', st.bump ? 0.8 : 0.45);
    patch({
      robot: st.robot,
      runningUid: st.uid,
      score: st.score,
      progress: progressOf(m, st.robot),
      ...(st.bump ? { bumpKey: get().bumpKey + 1 } : null),
    });
    timer = setTimeout(tick, st.wait ? 300 : st.mark ? 180 : 420);
  };
  tick();
}
