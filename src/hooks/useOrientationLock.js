import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

const L = ScreenOrientation.OrientationLock;
const LANDSCAPE_LOCKS = [L.LANDSCAPE, L.LANDSCAPE_LEFT, L.LANDSCAPE_RIGHT];

/**
 * Locks the device orientation while the calling screen is focused and reports when it is
 * SAFE TO RENDER: the lock was applied AND the window really has the wanted shape.
 * Rendering earlier lays the screen out with the old (rotated) size, which on real phones
 * leaves content overflowing the bottom edge and touches landing in the wrong place.
 * A 1.5s timeout (and the web, which cannot rotate) falls back to "ready".
 *
 * @param {ScreenOrientation.OrientationLock} lock
 * @returns {boolean} ready
 */
export default function useOrientationLock(lock) {
  // Real root-view size (see OrientedScreen): the shape check must use the same size the
  // screen is laid out with, otherwise content could mount before the frame has rotated.
  const { width, height } = useSafeAreaFrame();
  const [applied, setApplied] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setApplied(false);
      setTimedOut(false);
      ScreenOrientation.lockAsync(lock)
        .then(() => alive && setApplied(true))
        .catch(() => alive && setApplied(true)); // unsupported platform
      const t = setTimeout(() => alive && setTimedOut(true), 1500);
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }, [lock])
  );

  const wantLandscape = LANDSCAPE_LOCKS.includes(lock);
  const shapeOk = wantLandscape ? width > height : height > width;
  return applied && (shapeOk || timedOut);
}

export const OrientationLock = ScreenOrientation.OrientationLock;
