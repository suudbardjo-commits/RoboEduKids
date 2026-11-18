import React from 'react';
import { View } from 'react-native';

import { paper } from '../theme';

/**
 * Robo, tokoh cerita. Digambar dari bentuk sederhana: badan kotak, antena, dua mata, senyum.
 * Dipakai di Beranda sebagai tokoh yang mengajak anak mulai bermain.
 */
export default function Robo({ size = 120, body = paper.tomato, ink = paper.ink }) {
  const u = size / 120; // satuan skala
  const line = Math.max(2, 3 * u);
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      {/* antena */}
      <View style={{ width: line, height: 16 * u, backgroundColor: ink, marginTop: 2 * u }} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: 14 * u,
          height: 14 * u,
          borderRadius: 7 * u,
          backgroundColor: paper.mustard,
          borderWidth: line,
          borderColor: ink,
        }}
      />
      {/* badan */}
      <View
        style={{
          width: 96 * u,
          height: 78 * u,
          backgroundColor: body,
          borderWidth: line,
          borderColor: ink,
          borderTopLeftRadius: 22 * u,
          borderTopRightRadius: 16 * u,
          borderBottomRightRadius: 24 * u,
          borderBottomLeftRadius: 14 * u,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 16 * u }}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={{
                width: 22 * u,
                height: 22 * u,
                borderRadius: 11 * u,
                backgroundColor: paper.white,
                borderWidth: line,
                borderColor: ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 8 * u, height: 8 * u, borderRadius: 4 * u, backgroundColor: ink }} />
            </View>
          ))}
        </View>
        <View
          style={{
            marginTop: 8 * u,
            width: 28 * u,
            height: 12 * u,
            borderBottomLeftRadius: 14 * u,
            borderBottomRightRadius: 14 * u,
            borderBottomWidth: line,
            borderLeftWidth: line,
            borderRightWidth: line,
            borderColor: ink,
          }}
        />
      </View>
    </View>
  );
}
