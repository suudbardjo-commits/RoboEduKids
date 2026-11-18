import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { BLOCKS } from './blocks';
import DraggableBlock from './DraggableBlock';
import { paper } from '../theme';

/** Rak di bawah: blok perintah besar. Diketuk untuk menambah, atau diseret ke kanvas. */
export default function Tray({ blockSize, bottomInset = 0, onDrop }) {
  return (
    <View style={[styles.tray, { height: blockSize + 36 + bottomInset, paddingBottom: bottomInset }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {BLOCKS.map((_, i) => (
          <DraggableBlock key={i} typeIndex={i} size={blockSize} inScroll onDrop={onDrop} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    backgroundColor: paper.paperDeep,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: paper.ink,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 26,
  },
});
