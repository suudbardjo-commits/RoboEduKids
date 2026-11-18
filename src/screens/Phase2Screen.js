import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';

import { night } from '../theme';
import OrientedScreen from '../components/OrientedScreen';
import { OrientationLock } from '../hooks/useOrientationLock';
import Simulator from '../phase2/Simulator';
import ModeToggle from '../phase2/ModeToggle';
import CodeWorkspace from '../phase2/CodeWorkspace';
import { resetWorld, startRun, stopRun } from '../phase2/runner';
import { useMusic } from '../audio';

const HANDLE_H = 76; // grabber + toggle; also the minimum height of the 10% snap
const SIM_RATIO = 0.36; // simulator takes ~36% of the screen in EDIT mode

/**
 * FASE 2 - "Junior Programmer" (kelas 4-6), khusus portrait, tema buku catatan malam (gelap).
 *  - Top: simulator/arena (36% in EDIT, full screen in PLAY)
 *  - Bottom: @gorhom/bottom-sheet snapping at 10% / 50% / 90%
 *  - The EDIT CODE | PLAY GAME switch lives in the sheet handle, i.e. right
 *    between the arena and the workspace, and is visible at every snap point.
 */
function Phase2Content({ navigation }) {

  // Full root size (includes the area behind the system bars), see OrientedScreen.
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);
  useMusic('malam');
  const [mode, setMode] = useState('edit');
  const playing = mode === 'play';

  // Android selalu edge-to-edge: sheet digambar sampai ke belakang tombol navigasi HP.
  // Tambah insets.bottom supaya handle + toggle tetap di ATAS nav bar 3-tombol
  // (kalau navigasi gesture, insets.bottom kecil jadi hampir tidak berubah).
  const navBar = insets.bottom;
  const minSnap = Math.max(Math.round(height * 0.12), HANDLE_H) + navBar;
  // Persen (bukan piksel) supaya posisi awal tidak bergantung pada kapan layar selesai diukur.
  // Jarak ke nav bar diberikan lewat bottomInset pada BottomSheet.
  const snapPoints = useMemo(() => ['12%', '60%', '90%'], []);

  // Simulator height animates between 36% (edit) and everything above the collapsed sheet (play).
  const simH = useSharedValue(height * SIM_RATIO);
  useEffect(() => {
    simH.value = withTiming(playing ? height - minSnap : height * SIM_RATIO, { duration: 350 });
  }, [playing, height, minSnap, simH]);
  const simStyle = useAnimatedStyle(() => ({ height: simH.value }));

  // Reset dunia saat masuk; hentikan timer saat keluar.
  useEffect(() => {
    resetWorld();
    return stopRun;
  }, []);

  const changeMode = useCallback((next) => {
    setMode(next);
    sheetRef.current?.snapToIndex(next === 'play' ? 0 : 1);
    // MAIN GAME: tunggu simulator selesai membesar, lalu langsung jalankan kode.
    if (next === 'play') setTimeout(startRun, 400);
  }, []);

  const renderHandle = useCallback(
    () => (
      <View style={styles.handle}>
        <View style={styles.grabber} />
        <ModeToggle mode={mode} onChange={changeMode} />
      </View>
    ),
    [mode, changeMode]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.View style={[styles.sim, simStyle]}>
        <Simulator topInset={insets.top} onBack={() => navigation.goBack()} />
      </Animated.View>

      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        bottomInset={navBar}
        handleComponent={renderHandle}
        backgroundStyle={styles.sheetBg}
        // In PLAY mode the sheet is parked at its smallest snap and cannot be dragged.
        enableHandlePanningGesture={!playing}
        enableContentPanningGesture={!playing}
        enableOverDrag={false}
      >
        <View style={[styles.sheetBody, playing && styles.hidden]} pointerEvents={playing ? 'none' : 'auto'}>
          <CodeWorkspace
            bottomPad={height * 0.5}
            canvasW={width}
            canvasH={height * 0.9}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: night.bg },
  sim: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  sheetBg: {
    backgroundColor: night.panel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: night.chalk,
  },
  handle: { height: HANDLE_H, justifyContent: 'center', gap: 8, paddingTop: 6 },
  grabber: { alignSelf: 'center', width: 46, height: 5, borderRadius: 3, backgroundColor: night.chalkDim },
  sheetBody: { flex: 1 },
  hidden: { opacity: 0 },
});

/** Khusus portrait; isi baru dirender setelah layar benar-benar portrait. */
export default function Phase2Screen({ navigation }) {
  return (
    <OrientedScreen lock={OrientationLock.PORTRAIT_UP} background={night.bg} spinner={night.chalk}>
      <Phase2Content navigation={navigation} />
    </OrientedScreen>
  );
}
