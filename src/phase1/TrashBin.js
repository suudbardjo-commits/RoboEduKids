import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useDrag } from './DragContext';
import { paper, fonts, wob } from '../theme';

/**
 * Tong sampah di samping kanvas. Aktif saat blok kanvas diseret, dan berubah merah
 * dan membesar begitu blok berada di luar kanvas (artinya akan dihapus).
 */
export default function TrashBin({ width }) {
  const drag = useDrag();

  const style = useAnimatedStyle(() => {
    const dragging = drag.active.value && drag.srcIndex.value >= 0;
    const willDelete = dragging && !drag.overCanvas.value;
    return {
      opacity: withSpring(dragging ? 1 : 0.55),
      backgroundColor: willDelete ? paper.tomato : paper.paperDeep,
      transform: [{ scale: withSpring(willDelete ? 1.18 : dragging ? 1.05 : 1) }],
    };
  });

  return (
    <Animated.View style={[styles.bin, wob(width * 0.3, 3), { width, height: width * 1.1 }, style]}>
      <Ionicons name="trash" size={width * 0.46} color={paper.ink} />
      <Text style={[styles.text, { fontSize: Math.max(11, width * 0.17) }]}>Buang</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bin: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 3, borderColor: paper.ink },
  text: { fontFamily: fonts.hand, color: paper.ink },
});
