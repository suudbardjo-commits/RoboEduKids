import React from 'react';
import { Pressable } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import BlockView from './BlockView';
import { useDrag, updateDrag } from './DragContext';

/**
 * A block the child can pick up.
 *  - srcIndex === -1 : lives in the tray (dragging spawns a copy via the ghost)
 *  - srcIndex >= 0   : lives on the canvas at that position
 * `onDrop(typeIndex, srcIndex, insideCanvas)` is called on the JS thread on release.
 * `inScroll` makes the gesture yield to the tray's horizontal scrolling:
 * a mostly-vertical drag picks the block up, a horizontal swipe scrolls.
 */
export default function DraggableBlock({ typeIndex, srcIndex = -1, size, inScroll = false, onDrop }) {
  const drag = useDrag();

  const pan = usePanGesture({
    // In the tray: vertical drag picks up, horizontal swipe fails -> scrolls.
    // On the canvas: any 6px move picks the block up.
    // (RNGH forbids minDistance together with fail offsets, so offsets only.)
    activeOffsetX: inScroll ? [-10000, 10000] : [-6, 6],
    activeOffsetY: inScroll ? [-6, 6] : [-6, 6],
    failOffsetX: inScroll ? [-24, 24] : [-10000, 10000],
    onActivate: (e) => {
      'worklet';
      drag.typeIdx.value = typeIndex;
      drag.srcIndex.value = srcIndex;
      drag.active.value = 1;
      updateDrag(drag, e.absoluteX, e.absoluteY);
    },
    onUpdate: (e) => {
      'worklet';
      updateDrag(drag, e.absoluteX, e.absoluteY);
    },
    onDeactivate: (e) => {
      'worklet';
      updateDrag(drag, e.absoluteX, e.absoluteY);
      scheduleOnRN(onDrop, typeIndex, srcIndex, drag.overCanvas.value === 1);
    },
    onFinalize: () => {
      'worklet';
      drag.active.value = 0;
      drag.srcIndex.value = -1;
    },
  });

  // The canvas block being dragged fades out; the ghost represents it.
  const fade = useAnimatedStyle(() => ({
    opacity: srcIndex >= 0 && drag.active.value && drag.srcIndex.value === srcIndex ? 0.25 : 1,
  }));

  // Blok di tray juga bisa DIKETUK (bukan hanya diseret): ketukan langsung menambah blok
  // ke program. Anak kecil hampir selalu mengetuk dulu sebelum mencoba menyeret.
  const fromTray = srcIndex === -1;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={fade}>
        {fromTray ? (
          <Pressable onPress={() => onDrop(typeIndex, -1, true)}>
            <BlockView typeIndex={typeIndex} size={size} />
          </Pressable>
        ) : (
          <BlockView typeIndex={typeIndex} size={size} />
        )}
      </Animated.View>
    </GestureDetector>
  );
}
