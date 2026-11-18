import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { BLOCK_INDEX } from './blocks';
import DraggableBlock from './DraggableBlock';
import { useDrag } from './DragContext';
import { paper, fonts, wob } from '../theme';

const IDLE = { backgroundColor: '#FFFDF6', borderColor: paper.ink };
const ADD = { backgroundColor: '#E3F0E1', borderColor: paper.leaf };
const REMOVE = { backgroundColor: '#F8DDD2', borderColor: paper.tomato };

/**
 * Kanvas: tempat menjatuhkan blok. Blok tersusun dari kiri ke kanan setelah tanda "mulai" Robo.
 * Menyeret blok dari kanvas lalu melepasnya di luar kanvas = menghapusnya.
 */
export default function Canvas({ program, cellSize, playingIndex, onDrop }) {
  const drag = useDrag();
  const ref = useRef(null);

  // Hijau saat blok tray melayang di atas kanvas; merah muda saat blok kanvas akan dihapus.
  const surface = useAnimatedStyle(() => {
    if (!drag.active.value) return IDLE;
    if (drag.overCanvas.value) return ADD;
    return drag.srcIndex.value >= 0 ? REMOVE : IDLE;
  });

  return (
    <Animated.View
      ref={ref}
      collapsable={false}
      onLayout={() => drag.registerCanvas(ref)}
      style={[styles.canvas, wob(26, 1), surface]}
    >
      <View style={styles.flow}>
        <View style={[styles.start, wob(cellSize * 0.3, 2), { width: cellSize, height: cellSize }]}>
          <View style={styles.eyes}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.eye, { width: cellSize * 0.2, height: cellSize * 0.2, borderRadius: cellSize * 0.1 }]}>
                <View style={{ width: cellSize * 0.08, height: cellSize * 0.08, borderRadius: cellSize * 0.04, backgroundColor: paper.ink }} />
              </View>
            ))}
          </View>
          <Text style={[styles.startText, { fontSize: Math.max(11, cellSize * 0.2) }]}>Mulai</Text>
        </View>

        {program.map((id, i) => (
          <PlayHighlight key={`${i}-${id}`} active={playingIndex === i}>
            <DraggableBlock typeIndex={BLOCK_INDEX[id]} srcIndex={i} size={cellSize} onDrop={onDrop} />
          </PlayHighlight>
        ))}

        {program.length === 0 && (
          <View style={styles.hint}>
            {[0, 1, 2].map((n) => (
              <View key={n} style={[styles.slot, wob(cellSize * 0.26, n), { width: cellSize, height: cellSize }]} />
            ))}
            <Text style={[styles.hintText, { fontSize: Math.max(15, cellSize * 0.26) }]}>
              Ketuk atau seret blok ke sini
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

/** Cincin tomat + sedikit membesar pada blok yang sedang dijalankan. */
function PlayHighlight({ active, children }) {
  return <View style={[styles.hl, active && styles.hlOn]}>{children}</View>;
}

const styles = StyleSheet.create({
  canvas: { flex: 1, borderWidth: 3, borderStyle: 'dashed', padding: 12 },
  flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  start: {
    backgroundColor: paper.tomato,
    borderWidth: 3,
    borderColor: paper.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyes: { flexDirection: 'row', gap: 6 },
  eye: { backgroundColor: paper.white, borderWidth: 2, borderColor: paper.ink, alignItems: 'center', justifyContent: 'center' },
  startText: { fontFamily: fonts.hand, color: paper.white, marginTop: 2 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, flexWrap: 'wrap' },
  slot: { borderWidth: 3, borderStyle: 'dashed', borderColor: '#C9B88F' },
  hintText: { fontFamily: fonts.hand, color: '#6B5F45', flexShrink: 1 },
  hl: { padding: 3, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  hlOn: { borderColor: paper.tomato, backgroundColor: '#FBE3D9', transform: [{ scale: 1.08 }] },
});
