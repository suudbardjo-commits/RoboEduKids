import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { night, fonts } from '../theme';
import { StickerButton } from '../components/Sticker';
import { usePhase2Store } from './store';
import { MISSIONS } from './missions';
import { resetWorld, startRun } from './runner';
import GridBoard, { NEON } from '../engine/GridBoard';

// Warna pesan status; teksnya selalu ikut menjelaskan, jadi warna bukan satu-satunya petunjuk.
const STATUS_COLOR = {
  win: night.blue,
  fail: night.mustard,
  error: night.tomato,
};

const SHADOW = '#0B0C10';

/**
 * Simulator / Arena di bagian atas: HUD (kemajuan + skor), pemilih misi, dan papan grid
 * tempat robot menjalankan kode. Ukuran papan menyesuaikan area yang tersedia
 * (kecil saat EDIT, besar saat MAIN GAME).
 */
export default function Simulator({ topInset, onBack }) {
  const progress = usePhase2Store((s) => s.progress);
  const score = usePhase2Store((s) => s.score);
  const mission = usePhase2Store((s) => s.mission);
  const best = usePhase2Store((s) => s.best);
  const robot = usePhase2Store((s) => s.robot);
  const bumpKey = usePhase2Store((s) => s.bumpKey);
  const status = usePhase2Store((s) => s.status);
  const message = usePhase2Store((s) => s.message);
  const setMission = usePhase2Store((s) => s.setMission);

  const [area, setArea] = useState({ w: 0, h: 0 });
  const m = MISSIONS[mission];
  const running = status === 'running';

  const go = (d) => {
    if (running) return;
    setMission((mission + d + MISSIONS.length) % MISSIONS.length);
    resetWorld();
  };

  const small = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' };
  const tone = STATUS_COLOR[status] || night.chalk;

  return (
    <View style={styles.root}>
      {/* HUD */}
      <View style={[styles.hud, { paddingTop: topInset + 8 }]}>
        <StickerButton
          onPress={onBack}
          label="Kembali ke beranda"
          bg={night.panel}
          ink={night.chalk}
          shadow={SHADOW}
          radius={12}
          depth={3}
          k={1}
          faceStyle={small}
        >
          <Ionicons name="chevron-back" size={22} color={night.chalk} />
        </StickerButton>
        <View style={styles.hudCol}>
          <Text style={styles.hudText}>Kemajuan {progress}%</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Skor</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Pemilih misi + kontrol */}
      <View style={styles.missionRow}>
        <Pressable
          onPress={() => go(-1)}
          hitSlop={6}
          disabled={running}
          accessibilityRole="button"
          accessibilityLabel="Misi sebelumnya"
          style={styles.arrow}
        >
          <Ionicons name="chevron-back" size={26} color={running ? night.chalkDim : night.chalk} />
        </Pressable>
        <View style={styles.missionTitle}>
          <Text style={styles.missionSub}>Misi {mission + 1} dari {MISSIONS.length}</Text>
          <Text style={styles.missionText} numberOfLines={1}>
            {m.name}
          </Text>
          {best[mission] ? <Text style={styles.bestText}>Terbaik {best[mission]}</Text> : null}
        </View>
        <Pressable
          onPress={() => go(1)}
          hitSlop={6}
          disabled={running}
          accessibilityRole="button"
          accessibilityLabel="Misi berikutnya"
          style={styles.arrow}
        >
          <Ionicons name="chevron-forward" size={26} color={running ? night.chalkDim : night.chalk} />
        </Pressable>
        <StickerButton
          onPress={resetWorld}
          label="Kembalikan Robo ke awal"
          bg={night.panel}
          ink={night.chalk}
          shadow={SHADOW}
          radius={12}
          depth={3}
          k={2}
          faceStyle={small}
        >
          <Ionicons name="refresh" size={20} color={night.chalk} />
        </StickerButton>
        <StickerButton
          onPress={startRun}
          disabled={running}
          label={running ? 'Kode sedang berjalan' : 'Jalankan kode'}
          bg={night.tomato}
          ink={night.chalk}
          shadow={SHADOW}
          radius={12}
          depth={3}
          k={3}
          faceStyle={[small, running && { opacity: 0.6 }]}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
        </StickerButton>
      </View>

      {/* Papan arena */}
      <View style={styles.arena} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {area.w > 0 && (
          <GridBoard level={m} robot={robot} bumpKey={bumpKey} availW={area.w} availH={area.h} theme={NEON} />
        )}
        {message ? (
          <View style={[styles.banner, { borderColor: tone }]}>
            <Text style={[styles.bannerText, { color: tone }]}>{message}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 6 },
  hudCol: { flex: 1 },
  hudText: { color: night.chalk, fontFamily: fonts.bodyHeavy, fontSize: 14 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: night.panelHi, marginTop: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: night.blue },
  scoreBox: { alignItems: 'center', minWidth: 56 },
  scoreLabel: { color: night.chalkDim, fontFamily: fonts.body, fontSize: 12 },
  scoreText: { color: night.mustard, fontFamily: fonts.hand, fontSize: 28, lineHeight: 30 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  arrow: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  missionTitle: { flex: 1, alignItems: 'center' },
  missionSub: { color: night.chalkDim, fontSize: 12, fontFamily: fonts.body },
  missionText: { color: night.chalk, fontSize: 20, lineHeight: 22, fontFamily: fonts.hand },
  bestText: { color: night.mustard, fontSize: 12, fontFamily: fonts.bodyHeavy },
  arena: { flex: 1, marginHorizontal: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  banner: {
    position: 'absolute',
    bottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: night.bg,
    maxWidth: '96%',
  },
  bannerText: { fontSize: 15, fontFamily: fonts.hand, textAlign: 'center' },
});
