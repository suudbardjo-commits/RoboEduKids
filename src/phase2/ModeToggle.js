import React, { useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { night, fonts } from '../theme';

/** Sakelar dua posisi: UBAH KODE | MAIN GAME. Penanda kapur bergeser di antara keduanya. */
export default function ModeToggle({ mode, onChange }) {
  const [w, setW] = useState(0);
  const p = useSharedValue(mode === 'play' ? 1 : 0);

  useEffect(() => {
    p.value = withSpring(mode === 'play' ? 1 : 0, { damping: 18, stiffness: 200 });
  }, [mode, p]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * (w / 2) }] }));

  return (
    <View style={styles.track} onLayout={(e) => setW(e.nativeEvent.layout.width - 14)}>
      <Animated.View style={[styles.thumb, { width: w / 2 }, thumb]} />
      <Pressable
        style={styles.half}
        onPress={() => onChange('edit')}
        accessibilityRole="button"
        accessibilityLabel="Ubah kode"
        accessibilityState={{ selected: mode === 'edit' }}
      >
        <Ionicons name="code-slash" size={18} color={mode === 'edit' ? night.bg : night.chalkDim} />
        <Text style={[styles.label, mode === 'edit' ? styles.on : styles.off]}>Ubah kode</Text>
      </Pressable>
      <Pressable
        style={styles.half}
        onPress={() => onChange('play')}
        accessibilityRole="button"
        accessibilityLabel="Main game"
        accessibilityState={{ selected: mode === 'play' }}
      >
        <Ionicons name="play" size={16} color={mode === 'play' ? night.bg : night.chalkDim} />
        <Text style={[styles.label, mode === 'play' ? styles.on : styles.off]}>Main game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '88%',
    maxWidth: 420,
    height: 48,
    padding: 4,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: night.chalk,
    backgroundColor: night.bg,
  },
  thumb: { position: 'absolute', left: 4, top: 4, bottom: 4, borderRadius: 10, backgroundColor: night.chalk },
  half: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 19, fontFamily: fonts.hand },
  on: { color: night.bg },
  off: { color: night.chalkDim },
});
