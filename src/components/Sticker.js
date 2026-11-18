import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { paper, wob } from '../theme';
import { playSfx } from '../audio';

/**
 * Motif identitas: benda bergaris tinta dengan bayangan keras satu arah (kanan bawah),
 * seperti stiker tempel. Bayangan keras dipilih karena terbaca jelas di layar kecil
 * dan tidak bergantung pada blur.
 */
function layers(depth, ink, radius, k, shadow) {
  const r = wob(radius, k);
  return {
    shadow: [
      StyleSheet.absoluteFill,
      { left: depth, top: depth, right: -depth, bottom: -depth, backgroundColor: shadow || ink, ...r },
    ],
    face: { borderWidth: 3, borderColor: ink, ...r },
  };
}

export function Sticker({ bg = paper.white, ink = paper.ink, shadow, radius = 18, depth = 4, k = 0, style, faceStyle, children }) {
  const l = layers(depth, ink, radius, k, shadow);
  return (
    <View style={[{ marginRight: depth, marginBottom: depth }, style]}>
      <View pointerEvents="none" style={l.shadow} />
      <View style={[l.face, { backgroundColor: bg }, faceStyle]}>{children}</View>
    </View>
  );
}

/** Tombol stiker: saat ditekan, permukaan turun menutup bayangannya. */
export function StickerButton({
  onPress,
  disabled,
  bg = paper.white,
  ink = paper.ink,
  shadow,
  radius = 18,
  depth = 4,
  k = 0,
  hitSlop = 8,
  label,
  style,
  faceStyle,
  children,
}) {
  const l = layers(depth, ink, radius, k, shadow);
  return (
    <Pressable
      onPress={(e) => {
        playSfx('ketuk', 0.55);
        onPress && onPress(e);
      }}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[{ marginRight: depth, marginBottom: depth }, style]}
    >
      {({ pressed }) => (
        <>
          <View pointerEvents="none" style={[l.shadow, pressed && { opacity: 0 }]} />
          <View
            style={[
              l.face,
              { backgroundColor: bg },
              pressed && { transform: [{ translateX: depth }, { translateY: depth }] },
              faceStyle,
            ]}
          >
            {children}
          </View>
        </>
      )}
    </Pressable>
  );
}
