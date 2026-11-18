import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Pengaturan aplikasi yang disimpan di perangkat. seenIntro: landing perkenalan sudah pernah dilihat. */
export const useSettings = create(
  persist(
    (set) => ({
      seenIntro: false,
      markIntroSeen: () => set({ seenIntro: true }),
    }),
    {
      name: 'roboedu-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
