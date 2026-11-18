import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { night, fonts } from '../theme';
import { CATEGORY_BY_ID } from './blockDefs';

const NOTCH_W = 30;
const NOTCH_H = 7;

/**
 * Blok modular bergaya Scratch. Ditumpuk tanpa jarak: "tonjolan" di bawah tiap blok masuk
 * ke "takik" di atas blok berikutnya (potongan berwarna kanvas). Blok topi (hat) berujung
 * bulat tanpa takik. Ketuk angka di dalam blok untuk menggantinya.
 */
export default function ScratchBlock({ def, vals, running, onRemove, onCycle, canvasColor }) {
  const color = CATEGORY_BY_ID[def.cat].color;
  let k = -1;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.body,
          { backgroundColor: color },
          def.hat ? styles.hat : styles.normal,
          running && styles.running,
        ]}
      >
        {!def.hat && <View style={[styles.notch, { backgroundColor: canvasColor }]} />}
        <View style={styles.row}>
          {def.parts.map((p, i) => {
            if (!p.opts) {
              return (
                <Text key={i} style={styles.text}>
                  {p.t}
                </Text>
              );
            }
            k += 1;
            const idx = k;
            return (
              <Pressable
                key={i}
                onPress={() => onCycle(idx)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Ganti nilai, sekarang ${vals[idx]}`}
                style={styles.pill}
              >
                <Text style={styles.pillText}>{vals[idx]}</Text>
                <Ionicons name="caret-down" size={10} color={night.chalk} />
              </Pressable>
            );
          })}
        </View>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Hapus blok"
            style={styles.remove}
          >
            <Ionicons name="close" size={14} color={night.bg} />
          </Pressable>
        )}
      </View>
      {/* tonjolan bawah */}
      <View style={[styles.bump, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', minWidth: 200 },
  body: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' },
  normal: { borderRadius: 6 },
  hat: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingTop: 14,
  },
  // Blok yang sedang jalan: bingkai tomat tebal, tanpa glow.
  running: { borderWidth: 3, borderColor: night.tomato },
  notch: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: NOTCH_W,
    height: NOTCH_H,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingRight: 30 },
  text: { color: night.bg, fontSize: 15, fontFamily: fonts.bodyHeavy },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 30,
    backgroundColor: night.bg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: { color: night.chalk, fontSize: 15, fontFamily: fonts.bodyHeavy },
  bump: {
    marginLeft: 16,
    width: NOTCH_W,
    height: NOTCH_H,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  remove: {
    position: 'absolute',
    right: 6,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22,24,31,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
