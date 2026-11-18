import React, { useEffect, useState } from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { paper } from '../theme';
import OrientedScreen from '../components/OrientedScreen';
import { OrientationLock } from '../hooks/useOrientationLock';
import StoryMap from '../phase1/StoryMap';
import Workspace from '../phase1/Workspace';
import { useMusic } from '../audio';

/** Isi Fase 1: Peta Cerita (pilih level) atau Workspace drag & drop. */
function Phase1Content({ navigation }) {
  const [level, setLevel] = useState(null); // null = peta cerita
  useMusic('pagi');

  // Tombol back Android: workspace -> peta dulu, baru keluar dari Fase 1.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (level !== null) {
        setLevel(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [level]);

  return (
    <View style={styles.fill}>
      <StatusBar hidden />
      {level === null ? (
        <StoryMap onSelect={setLevel} onBack={() => navigation.goBack()} />
      ) : (
        // key = level -> state papan/robot di-reset bersih tiap ganti level
        <Workspace key={level} level={level} onExit={() => setLevel(null)} onNext={setLevel} />
      )}
    </View>
  );
}

/**
 * FASE 1 - "Little Coder" (kelas 1-3), khusus landscape.
 * Isi baru dirender setelah layar benar-benar landscape (lihat OrientedScreen).
 */
export default function Phase1Screen({ navigation }) {
  return (
    <OrientedScreen lock={OrientationLock.LANDSCAPE} background={paper.paper}>
      <Phase1Content navigation={navigation} />
    </OrientedScreen>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
