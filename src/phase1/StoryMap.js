import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LEVEL_COUNT } from './blocks';
import { completedLevels, totalStars, usePhase1Store } from './store';
import { paper, fonts } from '../theme';
import { StickerButton } from '../components/Sticker';

// Pusat tiap level sebagai persen layar: jalan berkelok dari kiri ke kanan.
const NODES = Array.from({ length: LEVEL_COUNT }, (_, i) => ({
  x: 7 + (i * 86) / (LEVEL_COUNT - 1),
  y: [66, 42, 68, 40, 64, 44, 68, 38, 66, 42, 64, 40][i],
}));

/** Peta level: 12 stempel di sepanjang jalan putus-putus. Level berikutnya diberi tanda "Mulai". */
export default function StoryMap({ onSelect, onBack }) {
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const stars = usePhase1Store((s) => s.stars);
  const completed = completedLevels(stars);
  const audioOn = usePhase1Store((s) => s.audioOn);
  const toggleAudio = usePhase1Store((s) => s.toggleAudio);

  const nodeSize = Math.max(56, Math.min(84, Math.round(Math.min(width, height) * 0.17)));
  // Stempel diletakkan di area aman: nav bar 3 tombol bisa pindah ke sisi layar saat landscape.
  const safeW = width - insets.left - insets.right;
  const safeH = height - insets.top - insets.bottom;
  const pos = NODES.map((n) => ({
    x: insets.left + (n.x / 100) * safeW,
    y: insets.top + (n.y / 100) * safeH,
  }));
  const top = Math.max(insets.top, 8) + 8;
  const btn = { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' };

  return (
    <View style={styles.root}>
      {/* Jalan putus-putus antar level */}
      {pos.slice(0, -1).map((p, i) =>
        [0.2, 0.4, 0.6, 0.8].map((t) => (
          <View
            key={`${i}-${t}`}
            style={[
              styles.dot,
              {
                left: p.x + (pos[i + 1].x - p.x) * t - 4,
                top: p.y + (pos[i + 1].y - p.y) * t - 4,
              },
            ]}
          />
        ))
      )}

      {pos.map((p, i) => {
        const level = i + 1;
        const done = level <= completed;
        const current = level === completed + 1;
        const locked = level > completed + 1;
        const bg = done ? paper.leaf : current ? paper.tomato : paper.paperDeep;
        return (
          <View
            key={level}
            style={{ position: 'absolute', left: p.x - nodeSize / 2, top: p.y - nodeSize / 2, width: nodeSize, height: nodeSize }}
          >
            {current && (
              <View pointerEvents="none" style={styles.start}>
                <Text style={styles.startText}>Mulai</Text>
                <Ionicons name="caret-down" size={18} color={paper.ink} style={{ marginTop: -4 }} />
              </View>
            )}
            <StickerButton
              disabled={locked}
              onPress={() => onSelect(level)}
              label={locked ? `Level ${level} terkunci` : `Main level ${level}`}
              bg={bg}
              radius={nodeSize * 0.42}
              depth={4}
              k={i}
              hitSlop={6}
              style={{ marginRight: 0, marginBottom: 0 }}
              faceStyle={{ width: nodeSize - 4, height: nodeSize - 4, alignItems: 'center', justifyContent: 'center' }}
            >
              {locked ? (
                <Ionicons name="lock-closed" size={nodeSize * 0.4} color={paper.ink} />
              ) : (
                <Text style={[styles.nodeText, { fontSize: nodeSize * 0.52, color: current ? paper.white : paper.ink }]}>{level}</Text>
              )}
            </StickerButton>
            {done && (
              <View pointerEvents="none" style={styles.starRow}>
                {[1, 2, 3].map((n) => (
                  <Ionicons
                    key={n}
                    name={n <= (stars[level] || 0) ? 'star' : 'star-outline'}
                    size={nodeSize * 0.28}
                    color={n <= (stars[level] || 0) ? paper.mustard : paper.ink}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      <StickerButton
        onPress={onBack}
        label="Kembali ke beranda"
        radius={18}
        k={1}
        style={{ position: 'absolute', left: insets.left + 16, top }}
        faceStyle={btn}
      >
        <Ionicons name="home" size={26} color={paper.ink} />
      </StickerButton>

      <View style={[styles.title, { top: top + 2 }]}>
        <Text style={styles.titleText}>Petualangan Robo</Text>
        <Text style={styles.titleSub}>
          {completed} dari {LEVEL_COUNT} level selesai, {totalStars(stars)} bintang
        </Text>
      </View>

      <StickerButton
        onPress={toggleAudio}
        label={audioOn ? 'Matikan getar' : 'Nyalakan getar'}
        bg={audioOn ? paper.mustard : paper.paperDeep}
        radius={18}
        k={3}
        style={{ position: 'absolute', right: insets.right + 16, top }}
        faceStyle={btn}
      >
        <Ionicons name={audioOn ? 'volume-high' : 'volume-mute'} size={26} color={paper.ink} />
      </StickerButton>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: paper.paper, overflow: 'hidden' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: paper.ink, opacity: 0.35 },
  nodeText: { fontFamily: fonts.hand },
  start: { position: 'absolute', top: -34, left: -10, right: -10, alignItems: 'center' },
  startText: { fontFamily: fonts.hand, fontSize: 20, color: paper.ink },
  starRow: { position: 'absolute', bottom: -22, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  title: { position: 'absolute', alignSelf: 'center', alignItems: 'center' },
  titleText: { fontFamily: fonts.hand, fontSize: 30, lineHeight: 34, color: paper.ink },
  titleSub: { fontFamily: fonts.body, fontSize: 13, color: paper.ink, opacity: 0.8 },
});
