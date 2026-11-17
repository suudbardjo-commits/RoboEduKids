import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LEVEL_COUNT } from './blocks';
import { completedLevels, usePhase1Store } from './store';

// Node centres as % of the screen: a winding path from left to right.
const nodeStarOffset = 14;
const NODES = Array.from({ length: LEVEL_COUNT }, (_, i) => ({
  x: 7 + (i * 86) / (LEVEL_COUNT - 1),
  y: [64, 40, 66, 38, 62, 42, 66, 36, 64, 40, 62, 38][i],
}));

/**
 * Soft pulsing ring behind the level the child should play next.
 * It is purely decorative (pointerEvents none) so it can never steal or shift touches
 * from the real button on top.
 */
function PulseRing({ active, size }) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = active
      ? withRepeat(withSequence(withTiming(1.3, { duration: 650 }), withTiming(1, { duration: 650 })), -1)
      : 1;
  }, [active, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: active ? 0.55 : 0 }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: '#FDE047' },
        a,
      ]}
    />
  );
}

/** Full-screen story map with 12 level nodes. Only colored Views, no images. */
export default function StoryMap({ onSelect, onBack }) {
  // Full root size (includes the area behind the system bars), see OrientedScreen.
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const stars = usePhase1Store((s) => s.stars);
  const completed = completedLevels(stars);
  const audioOn = usePhase1Store((s) => s.audioOn);
  const toggleAudio = usePhase1Store((s) => s.toggleAudio);

  const nodeSize = Math.max(52, Math.min(84, Math.round(Math.min(width, height) * 0.17)));
  // Node diletakkan di dalam area aman: saat landscape, tombol navigasi HP (3 tombol)
  // biasanya pindah ke sisi kiri/kanan dan bisa menutupi level paling ujung.
  const safeW = width - insets.left - insets.right;
  const safeH = height - insets.top - insets.bottom;
  const pos = NODES.map((n) => ({
    x: insets.left + (n.x / 100) * safeW,
    y: insets.top + (n.y / 100) * safeH,
  }));

  return (
    <View style={styles.root}>
      {/* Background scenery */}
      <View style={[styles.sun, { right: width * 0.08 }]} />
      <View style={[styles.cloud, { left: width * 0.12, top: height * 0.1, width: 120 }]} />
      <View style={[styles.cloud, { left: width * 0.55, top: height * 0.17, width: 90 }]} />
      <View style={[styles.hill, { left: -width * 0.1, width: width * 0.7, height: width * 0.7, bottom: -width * 0.38, backgroundColor: '#4ADE80' }]} />
      <View style={[styles.hill, { right: -width * 0.15, width: width * 0.75, height: width * 0.75, bottom: -width * 0.45, backgroundColor: '#22C55E' }]} />

      {/* Dotted path between nodes */}
      {pos.slice(0, -1).map((p, i) =>
        [0.2, 0.4, 0.6, 0.8].map((t) => (
          <View
            key={`${i}-${t}`}
            style={[
              styles.dot,
              {
                left: p.x + (pos[i + 1].x - p.x) * t - 5,
                top: p.y + (pos[i + 1].y - p.y) * t - 5,
              },
            ]}
          />
        ))
      )}

      {/* Level nodes */}
      {pos.map((p, i) => {
        const level = i + 1;
        const done = level <= completed;
        const current = level === completed + 1;
        const locked = level > completed + 1;
        const bg = done ? '#22C55E' : current ? '#FACC15' : '#94A3B8';
        return (
          <View
            key={level}
            style={{
              position: 'absolute',
              left: p.x - nodeSize / 2,
              top: p.y - nodeSize / 2,
              width: nodeSize,
              height: nodeSize,
            }}
          >
            <PulseRing active={current} size={nodeSize} />
            <Pressable
              disabled={locked}
              hitSlop={8}
              onPress={() => onSelect(level)}
              style={[
                styles.node,
                { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2, backgroundColor: bg },
              ]}
            >
              {locked ? (
                <Ionicons name="lock-closed" size={nodeSize * 0.45} color="#fff" />
              ) : (
                <Text style={[styles.nodeText, { fontSize: nodeSize * 0.48 }]}>{level}</Text>
              )}
              {done && (
                <View style={styles.starRow}>
                  {[1, 2, 3].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= (stars[level] || 0) ? 'star' : 'star-outline'}
                      size={nodeSize * 0.3}
                      color="#FACC15"
                    />
                  ))}
                </View>
              )}
            </Pressable>
          </View>
        );
      })}

      <View style={[styles.title, { top: Math.max(insets.top, 8) + 10 }]}>
        <Ionicons name="rocket" size={20} color="#fff" />
        <Text style={styles.titleText}>Petualangan Robot</Text>
      </View>

      {/* Top corner buttons */}
      <Pressable onPress={onBack} hitSlop={8} style={[styles.corner, { left: insets.left + 16, top: Math.max(insets.top, 8) + 8 }]}>
        <Ionicons name="home" size={28} color="#1E293B" />
      </Pressable>
      <Pressable
        onPress={toggleAudio}
        hitSlop={8}
        style={[styles.corner, { right: insets.right + 16, top: Math.max(insets.top, 8) + 8, backgroundColor: audioOn ? '#38BDF8' : '#94A3B8' }]}
      >
        <Ionicons name={audioOn ? 'volume-high' : 'volume-mute'} size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7DD3FC', overflow: 'hidden' },
  sun: { position: 'absolute', top: 40, width: 90, height: 90, borderRadius: 45, backgroundColor: '#FDE047' },
  cloud: { position: 'absolute', height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.85)' },
  hill: { position: 'absolute', borderRadius: 9999 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.9)' },
  node: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  nodeText: { color: '#1E293B', fontWeight: '900' },
  starRow: { position: 'absolute', bottom: -nodeStarOffset, flexDirection: 'row' },
  title: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#1E293B',
  },
  titleText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  corner: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
