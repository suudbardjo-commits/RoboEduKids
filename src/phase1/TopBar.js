import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { paper, fonts } from '../theme';
import { StickerButton, Sticker } from '../components/Sticker';

/** Bilah atas: ke peta, nomor level, tombol MAIN (aksen), suara. MAIN satu-satunya yang berwarna tomat. */
export default function TopBar({ level, size, playing, audioOn, onBack, onPlay, onToggleAudio }) {
  const round = { width: size, height: size, alignItems: 'center', justifyContent: 'center' };
  return (
    <View style={styles.bar}>
      <StickerButton onPress={onBack} label="Kembali ke peta level" radius={size * 0.32} k={1} faceStyle={round}>
        <Ionicons name="map" size={size * 0.5} color={paper.ink} />
      </StickerButton>

      <Sticker bg={paper.paper} radius={size * 0.3} k={2} depth={3} faceStyle={styles.badge}>
        <Text style={[styles.badgeLabel, { fontSize: size * 0.34 }]}>Level</Text>
        <Text style={[styles.badgeNum, { fontSize: size * 0.62 }]}>{level}</Text>
      </Sticker>

      <StickerButton
        onPress={onPlay}
        disabled={playing}
        label={playing ? 'Robo sedang berjalan' : 'Jalankan program'}
        bg={paper.tomato}
        radius={size * 0.4}
        depth={5}
        k={0}
        faceStyle={[styles.play, { height: size * 1.1, opacity: playing ? 0.7 : 1 }]}
      >
        <Ionicons name={playing ? 'hourglass' : 'play'} size={size * 0.52} color={paper.white} />
        <Text style={[styles.playText, { fontSize: size * 0.58 }]}>{playing ? 'Jalan...' : 'MAIN'}</Text>
      </StickerButton>

      <StickerButton
        onPress={onToggleAudio}
        label={audioOn ? 'Matikan getar' : 'Nyalakan getar'}
        bg={audioOn ? paper.mustard : paper.paperDeep}
        radius={size * 0.32}
        k={3}
        faceStyle={round}
      >
        <Ionicons name={audioOn ? 'volume-high' : 'volume-mute'} size={size * 0.5} color={paper.ink} />
      </StickerButton>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  badge: { flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 16, paddingVertical: 2 },
  badgeLabel: { fontFamily: fonts.hand, color: paper.ink },
  badgeNum: { fontFamily: fonts.hand, color: paper.ink },
  play: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 34 },
  playText: { fontFamily: fonts.hand, color: paper.white, letterSpacing: 1 },
});
