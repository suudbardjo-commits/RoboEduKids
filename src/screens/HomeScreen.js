import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { paper, night, fonts } from '../theme';
import OrientedScreen from '../components/OrientedScreen';
import Robo from '../components/Robo';
import { StickerButton } from '../components/Sticker';
import { OrientationLock } from '../hooks/useOrientationLock';
import { completedLevels, totalStars, usePhase1Store } from '../phase1/store';
import { LEVEL_COUNT } from '../phase1/blocks';
import { MISSIONS } from '../phase2/missions';
import { usePhase2Store } from '../phase2/store';
import { playSfx, useMusic } from '../audio';

/** Satu titik per level atau misi: terisi = selesai. Lebih cepat dibaca anak daripada angka. */
function ProgressDots({ total, done, fill, empty, ink }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, { borderColor: ink, backgroundColor: i < done ? fill : empty }]} />
      ))}
    </View>
  );
}

/** Papan petunjuk jalan: papan bergaris tinta di atas tiang yang tertancap di bukit. */
function Signpost({ side, onPress, label, bg, radius, k, delay, children }) {
  const left = side === 'left';
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(420)}
      style={[styles.signWrap, left ? styles.signLeft : styles.signRight]}
    >
      <View style={[styles.post, left ? { left: 34 } : { right: 34 }]} />
      <StickerButton
        onPress={onPress}
        label={label}
        bg={bg}
        radius={radius}
        depth={6}
        k={k}
        style={{ transform: [{ rotate: left ? '-1.5deg' : '1.5deg' }] }}
        faceStyle={styles.plank}
      >
        {children}
      </StickerButton>
    </Animated.View>
  );
}

function HomeContent({ navigation }) {
  const { width } = useWindowDimensions();
  const sceneWidth = Math.min(width, 520);
  useMusic('pagi');

  const stars = usePhase1Store((s) => s.stars);
  const best = usePhase2Store((s) => s.best);
  const audioOn = usePhase1Store((s) => s.audioOn);
  const toggleAudio = usePhase1Store((s) => s.toggleAudio);
  const doneLevels = completedLevels(stars);
  const doneMissions = Object.keys(best).length;

  // Ketuk Robo: melompat kecil dan berbunyi. Tidak bergerak sendiri terus-menerus.
  const hop = useSharedValue(0);
  const roboStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.value }] }));
  const boop = () => {
    playSfx('robo');
    hop.value = withSequence(withTiming(-26, { duration: 140 }), withTiming(0, { duration: 170 }));
  };

  const iconBtn = { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.top}>
        <StickerButton
          onPress={() => navigation.navigate('Intro')}
          label="Lihat perkenalan lagi"
          radius={14}
          depth={3}
          k={1}
          faceStyle={iconBtn}
        >
          <Ionicons name="help" size={26} color={paper.ink} />
        </StickerButton>
        <StickerButton
          onPress={toggleAudio}
          label={audioOn ? 'Matikan suara' : 'Nyalakan suara'}
          bg={audioOn ? paper.mustard : paper.paperDeep}
          radius={14}
          depth={3}
          k={3}
          faceStyle={iconBtn}
        >
          <Ionicons name={audioOn ? 'volume-high' : 'volume-mute'} size={24} color={paper.ink} />
        </StickerButton>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.sky, { width: sceneWidth }]}>
          <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
            RoboEdu Kids
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.tagline}>
            Susun perintah, antar Robo ke bendera.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(260).duration(550)} style={styles.roboSpot}>
            <Pressable
              onPress={boop}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Sapa Robo"
              accessibilityHint="Robo melompat dan berbunyi"
            >
              <Animated.View style={roboStyle}>
                <Robo size={150} />
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Bukit tempat dua papan petunjuk tertancap */}
        <View style={[styles.hill, { width: sceneWidth, borderTopLeftRadius: sceneWidth * 0.5, borderTopRightRadius: sceneWidth * 0.5 }]}>
          <Signpost
            side="left"
            delay={500}
            onPress={() => navigation.navigate('Phase1')}
            label="Masuk Fase 1, Little Coder"
            bg={paper.mustard}
            radius={22}
            k={0}
          >
            <Text style={[styles.planTitle, { color: paper.ink }]}>Little Coder</Text>
            <Text style={[styles.planSub, { color: paper.ink }]}>Kelas 1 sampai 3. Seret blok, Robo berjalan.</Text>
            <ProgressDots total={LEVEL_COUNT} done={doneLevels} fill={paper.tomato} empty={paper.paper} ink={paper.ink} />
            <Text style={[styles.progress, { color: paper.ink }]}>
              {doneLevels} dari {LEVEL_COUNT} level selesai, {totalStars(stars)} bintang
            </Text>
          </Signpost>

          <Signpost
            side="right"
            delay={650}
            onPress={() => navigation.navigate('Phase2')}
            label="Masuk Fase 2, Junior Programmer"
            bg={night.bg}
            radius={12}
            k={2}
          >
            <Text style={[styles.planTitle, { color: night.chalk }]}>Junior Programmer</Text>
            <Text style={[styles.planSub, { color: night.chalkDim }]}>Kelas 4 sampai 6. Blok kode, skor, misi.</Text>
            <ProgressDots total={MISSIONS.length} done={doneMissions} fill={night.mustard} empty={night.panel} ink={night.chalkDim} />
            <Text style={[styles.progress, { color: night.chalk }]}>
              {doneMissions} dari {MISSIONS.length} misi selesai
            </Text>
          </Signpost>

          <Text style={styles.note}>Fase 1 dimainkan miring (landscape). Fase 2 dimainkan tegak.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: paper.paper },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' },
  sky: { alignItems: 'center', paddingTop: 4, zIndex: 2 },
  title: { fontFamily: fonts.hand, fontSize: 50, lineHeight: 54, color: paper.ink, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: paper.ink, textAlign: 'center', marginTop: 2 },
  roboSpot: { marginTop: 14, marginBottom: -30 },
  hill: {
    flexGrow: 1,
    backgroundColor: paper.leaf,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: paper.ink,
    paddingTop: 44,
    paddingBottom: 28,
    paddingHorizontal: 18,
    gap: 34,
  },
  signWrap: { width: '90%' },
  signLeft: { alignSelf: 'flex-start' },
  signRight: { alignSelf: 'flex-end' },
  post: { position: 'absolute', bottom: -22, width: 14, height: 40, backgroundColor: paper.ink, borderRadius: 3 },
  plank: { padding: 14 },
  planTitle: { fontFamily: fonts.hand, fontSize: 30, lineHeight: 34 },
  planSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, marginTop: 2 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  progress: { fontFamily: fonts.bodyHeavy, fontSize: 13, marginTop: 8 },
  note: { fontFamily: fonts.body, fontSize: 13, color: paper.ink, textAlign: 'center', marginTop: 4 },
});

/** Beranda selalu tegak; ini juga memulihkan portrait saat kembali dari Fase 1. */
export default function HomeScreen({ navigation }) {
  return (
    <OrientedScreen lock={OrientationLock.PORTRAIT_UP} background={paper.paper} spinner={paper.ink}>
      <HomeContent navigation={navigation} />
    </OrientedScreen>
  );
}
