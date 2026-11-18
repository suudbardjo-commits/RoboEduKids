import * as Haptics from 'expo-haptics';
import { usePhase1Store } from './store';
import { playSfx } from '../audio';

// Getar + efek suara. Tombol suara mematikan keduanya sekaligus.
const enabled = () => usePhase1Store.getState().audioOn;
const safe = (p) => p && p.catch && p.catch(() => {});

export const feedbackTap = () => {
  if (!enabled()) return;
  playSfx('tambah');
  safe(Haptics.selectionAsync());
};
export const feedbackStep = () => playSfx('langkah', 0.5);
export const feedbackBump = () => {
  if (!enabled()) return;
  playSfx('tabrak');
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
};
export const feedbackWin = () => {
  if (!enabled()) return;
  playSfx('menang');
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
};
export const feedbackLose = () => playSfx('gagal', 0.7);
