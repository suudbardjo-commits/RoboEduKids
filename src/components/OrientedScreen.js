import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import useOrientationLock from '../hooks/useOrientationLock';

/**
 * Wraps a screen that needs a fixed orientation.
 *  - children mount only AFTER the rotation finished, so their first layout is already correct
 *  - the box is capped to the real root size, so a stale (pre-rotation) frame can never push
 *    content past the screen edges
 *
 * The cap uses the safe-area FRAME (the real size of the app's root view), not
 * useWindowDimensions(): on Android without React Native's edge-to-edge flag (e.g. Expo Go)
 * the "window" height excludes the status bar and navigation bar, while the app is still drawn
 * edge-to-edge. Capping to that shorter height left an empty strip above the nav bar.
 */
export default function OrientedScreen({ lock, background, spinner = '#fff', children }) {
  const ready = useOrientationLock(lock);
  const { width, height } = useSafeAreaFrame();

  return (
    <View style={[styles.root, { backgroundColor: background, maxWidth: width, maxHeight: height }]}>
      {ready ? children : <ActivityIndicator style={styles.spin} color={spinner} size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  spin: { flex: 1 },
});
