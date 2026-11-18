import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, FadeInDown } from 'react-native-reanimated';

import { paper, fonts, wob } from '../theme';
import OrientedScreen from '../components/OrientedScreen';
import Robo from '../components/Robo';
import { Sticker, StickerButton } from '../components/Sticker';
import { OrientationLock } from '../hooks/useOrientationLock';
import BlockView from '../phase1/BlockView';
import { usePhase1Store } from '../phase1/store';
import { useSettings } from '../settings/store';
import { playSfx, useMusic } from '../audio';

const CELLS = 4; // papan contoh: Robo di kotak 0, bendera di kotak 3

/** Contoh bermain yang jalan sendiri sekali: tiga blok Maju muncul, lalu Robo berjalan ke bendera. */
function Demo({ runKey, width }) {
  const cell = Math.floor((width - 24) / CELLS);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const x = useSharedValue(0);
  const robotStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  useEffect(() => {
    setShown(0);
    setDone(false);
    x.value = 0;
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    [1, 2, 3].forEach((n, i) => at(900 + i * 650, () => { setShown(n); playSfx('tambah', 0.6); }));
    [1, 2, 3].forEach((n, i) =>
      at(3100 + i * 600, () => {
        x.value = withTiming(n * cell, { duration: 380 });
        playSfx('langkah', 0.5);
      })
    );
    at(4900, () => { setDone(true); playSfx('menang', 0.7); });
    return () => timers.forEach(clearTimeout);
  }, [runKey, cell, x]);

  const chip = Math.min(56, cell);
  return (
    <Sticker bg={paper.paperDeep} radius={24} depth={5} k={1} faceStyle={styles.demo}>
      <Text style={styles.demoLabel}>Contoh: tiga blok Maju</Text>

      <View style={[styles.board, { width: cell * CELLS, height: cell }]}>
        {Array.from({ length: CELLS }, (_, i) => (
          <View key={i} style={[styles.cell, { width: cell, height: cell, backgroundColor: i % 2 ? paper.paperDeep : paper.paper }]} />
        ))}
        <View style={[styles.flag, { left: cell * (CELLS - 1), width: cell, height: cell }]}>
          <Ionicons name="flag" size={cell * 0.5} color={paper.tomato} />
        </View>
        <Animated.View style={[styles.robo, { width: cell, height: cell }, robotStyle]}>
          <Robo size={cell * 0.92} />
        </Animated.View>
      </View>

      <View style={styles.chips}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: chip, height: chip, opacity: i < shown ? 1 : 0.25 }}>
            {i < shown ? (
              <BlockView typeIndex={0} size={chip} />
            ) : (
              <View style={[styles.slot, wob(chip * 0.24, i), { width: chip - 4, height: chip - 4 }]} />
            )}
          </View>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={[styles.demoResult, { opacity: done ? 1 : 0 }]}>Robo sampai!</Text>
      </View>
    </Sticker>
  );
}

function IntroContent({ navigation }) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 440);
  const audioOn = usePhase1Store((s) => s.audioOn);
  const toggleAudio = usePhase1Store((s) => s.toggleAudio);
  const markIntroSeen = useSettings((s) => s.markIntroSeen);
  const [runKey, setRunKey] = useState(0);
  useMusic('pagi');

  const next = useCallback(() => {
    markIntroSeen();
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Home');
  }, [markIntroSeen, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={[styles.top, { width: contentWidth }]}>
        <StickerButton
          onPress={toggleAudio}
          label={audioOn ? 'Matikan suara' : 'Nyalakan suara'}
          bg={audioOn ? paper.mustard : paper.paperDeep}
          radius={14}
          depth={3}
          k={3}
          faceStyle={styles.iconBtn}
        >
          <Ionicons name={audioOn ? 'volume-high' : 'volume-mute'} size={24} color={paper.ink} />
        </StickerButton>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={{ width: contentWidth }}>
          <Animated.View entering={FadeInDown.duration(450)} style={styles.hello}>
            <View style={{ transform: [{ rotate: '-6deg' }] }}>
              <Robo size={92} />
            </View>
            <Sticker bg={paper.white} radius={22} depth={4} k={2} style={{ flex: 1 }} faceStyle={styles.bubble}>
              <Text style={styles.hi}>Halo! Aku Robo.</Text>
              <Text style={styles.bubbleText}>Aku tersesat. Bantu aku sampai ke bendera ya.</Text>
            </Sticker>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(450)} style={{ marginTop: 22 }}>
            <Demo runKey={runKey} width={contentWidth - 8} />
            <Pressable
              onPress={() => setRunKey((k) => k + 1)}
              accessibilityRole="button"
              accessibilityLabel="Lihat contoh sekali lagi"
              style={styles.replay}
            >
              <Ionicons name="refresh" size={18} color={paper.ink} />
              <Text style={styles.replayText}>Lihat lagi</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(450)}>
            <Text style={styles.how}>Ketuk atau seret blok untuk menyusun perintah, lalu tekan MAIN.</Text>
            <StickerButton
              onPress={next}
              label="Mulai bermain"
              bg={paper.tomato}
              radius={22}
              depth={5}
              k={0}
              style={{ marginTop: 14 }}
              faceStyle={styles.cta}
            >
              <Text style={styles.ctaText}>Ayo bantu Robo</Text>
              <Ionicons name="play" size={22} color={paper.white} />
            </StickerButton>
            <Pressable onPress={next} accessibilityRole="button" accessibilityLabel="Lewati perkenalan" style={styles.skip}>
              <Text style={styles.skipText}>Lewati</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: paper.paper, alignItems: 'center' },
  top: { alignItems: 'flex-end', paddingTop: 8 },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubble: { padding: 14 },
  hi: { fontFamily: fonts.hand, fontSize: 28, lineHeight: 32, color: paper.ink },
  bubbleText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: paper.ink, marginTop: 2 },
  demo: { padding: 12, alignItems: 'center', gap: 10 },
  demoLabel: { fontFamily: fonts.hand, fontSize: 20, color: paper.ink, alignSelf: 'flex-start' },
  board: { flexDirection: 'row', borderWidth: 3, borderColor: paper.ink, borderRadius: 14, overflow: 'hidden' },
  cell: {},
  flag: { position: 'absolute', top: 0, alignItems: 'center', justifyContent: 'center' },
  robo: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' },
  slot: { borderWidth: 3, borderStyle: 'dashed', borderColor: '#C9B88F' },
  demoResult: { fontFamily: fonts.hand, fontSize: 22, color: paper.leaf },
  replay: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', minHeight: 44, paddingHorizontal: 6 },
  replayText: { fontFamily: fonts.bodyHeavy, fontSize: 14, color: paper.ink },
  how: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: paper.ink, textAlign: 'center', marginTop: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, minHeight: 56 },
  ctaText: { fontFamily: fonts.hand, fontSize: 28, color: paper.white },
  skip: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', paddingHorizontal: 16 },
  skipText: { fontFamily: fonts.bodyHeavy, fontSize: 15, color: paper.ink, textDecorationLine: 'underline' },
});

/** Landing perkenalan: muncul sekali saat pertama membuka aplikasi, bisa dibuka lagi dari tombol bantuan di Beranda. */
export default function IntroScreen({ navigation }) {
  return (
    <OrientedScreen lock={OrientationLock.PORTRAIT_UP} background={paper.paper} spinner={paper.ink}>
      <IntroContent navigation={navigation} />
    </OrientedScreen>
  );
}
