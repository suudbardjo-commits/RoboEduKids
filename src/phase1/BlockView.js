import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BLOCKS } from './blocks';
import { paper, fonts, wob } from '../theme';

/** Tampilan satu blok perintah (tanpa gestur): stiker bergaris tinta dengan ikon dan kata. */
export default function BlockView({ typeIndex, size }) {
  const b = BLOCKS[typeIndex];
  const depth = Math.max(3, Math.round(size * 0.055));
  const face = size - depth;
  const r = wob(size * 0.24, typeIndex);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[StyleSheet.absoluteFill, { left: depth, top: depth, backgroundColor: paper.ink }, r]}
      />
      <View
        style={[
          styles.face,
          { width: face, height: face, backgroundColor: b.color, borderColor: paper.ink },
          r,
        ]}
      >
        <Ionicons name={b.icon} size={face * 0.46} color={paper.ink} />
        <Text style={[styles.label, { fontSize: Math.max(12, face * 0.2) }]} numberOfLines={1}>
          {b.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.hand, color: paper.ink, marginTop: -2 },
});
