import { useCallback } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { usePhase1Store } from '../phase1/store';

// Semua suara dibuat sendiri lewat scripts/make-audio.js (sintesis), bukan sampel orang lain.
const SOURCES = {
  pagi: require('../../assets/audio/musik-pagi.wav'),
  malam: require('../../assets/audio/musik-malam.wav'),
  ketuk: require('../../assets/audio/sfx-ketuk.wav'),
  tambah: require('../../assets/audio/sfx-tambah.wav'),
  langkah: require('../../assets/audio/sfx-langkah.wav'),
  tabrak: require('../../assets/audio/sfx-tabrak.wav'),
  menang: require('../../assets/audio/sfx-menang.wav'),
  gagal: require('../../assets/audio/sfx-gagal.wav'),
  robo: require('../../assets/audio/sfx-robo.wav'),
};

const MUSIC_VOLUME = 0.32;
const players = {};
let current = null; // nama lagu yang sedang dipilih
let appActive = true;
let ready = false;

/** Tombol suara satu-satunya: mati berarti tanpa lagu, tanpa efek, tanpa getar. */
const soundOn = () => usePhase1Store.getState().audioOn;

function init() {
  if (ready) return;
  ready = true;
  // Campur dengan suara aplikasi lain (musik di HP anak tidak ikut terputus) dan tetap bunyi walau mode senyap iOS.
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
}

function player(name) {
  init();
  if (players[name] === undefined) {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
    } catch {
      players[name] = null; // perangkat tanpa audio: aplikasi tetap jalan tanpa suara
    }
  }
  return players[name];
}

/** Terapkan keadaan terkini: lagu terpilih bunyi hanya jika suara menyala dan aplikasi sedang terbuka. */
function sync() {
  Object.keys(players).forEach((name) => {
    if (!name.startsWith('musik:')) return;
    const p = players[name];
    if (!p) return;
    const want = name === `musik:${current}` && soundOn() && appActive;
    try {
      if (want) p.play();
      else p.pause();
    } catch {
      // abaikan
    }
  });
}

export function playMusic(track) {
  current = track;
  const key = `musik:${track}`;
  if (players[key] === undefined) {
    try {
      init();
      const p = createAudioPlayer(SOURCES[track]);
      p.loop = true;
      p.volume = MUSIC_VOLUME;
      players[key] = p;
    } catch {
      players[key] = null;
    }
  }
  sync();
}

export function playSfx(name, volume = 0.8) {
  if (!soundOn()) return;
  const p = player(name);
  if (!p) return;
  try {
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    // abaikan
  }
}

// Jeda saat aplikasi ke latar belakang, lanjut saat kembali; ikuti tombol suara.
AppState.addEventListener('change', (s) => {
  appActive = s === 'active';
  sync();
});
let lastOn = soundOn();
usePhase1Store.subscribe((s) => {
  if (s.audioOn !== lastOn) {
    lastOn = s.audioOn;
    sync();
  }
});

/** Pakai di layar: lagu ini diputar selama layar fokus. */
export function useMusic(track) {
  useFocusEffect(
    useCallback(() => {
      playMusic(track);
    }, [track])
  );
}
