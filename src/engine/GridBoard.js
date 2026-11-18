import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

/** Tema visual. Logika papan sama; hanya tampilan per fase yang beda. */
export const PLAYFUL = {
  cellA: '#FBF3E0',
  cellB: '#F1E3C2',
  line: 'transparent',
  radius: 0.2,
  wallBg: '#9A7B57',
  wallBorder: '#2B2A33',
  wallIcon: null,
  wallColor: '#C9AD86',
  goalBg: '#F2B544',
  goalBorder: '#2B2A33',
  goalColor: '#E4572E',
  robotBg: '#E4572E',
  robotBorder: '#2B2A33',
  robotColor: '#FFFFFF',
  frame: '#2B2A33',
};

export const NEON = {
  cellA: '#21242E',
  cellB: '#2A2E3A',
  line: 'transparent',
  radius: 0.12,
  wallBg: '#4A4F5F',
  wallBorder: '#ECE7DA',
  wallIcon: null,
  wallColor: '#6C7286',
  goalBg: '#3A3426',
  goalBorder: '#F2B544',
  goalColor: '#F2B544',
  robotBg: '#E4572E',
  robotBorder: '#ECE7DA',
  robotColor: '#FFFFFF',
  frame: '#ECE7DA',
};

/**
 * Grid world with walls, goal and an animated robot.
 * Fits itself into availW x availH (square cells) and centres itself.
 * `bumpKey` changes -> the robot shakes (it hit a wall).
 */
export default function GridBoard({ level, robot, bumpKey = 0, availW, availH, theme }) {
  const cell = Math.max(10, Math.floor(Math.min(availW / level.cols, availH / level.rows)));
  const w = cell * level.cols;
  const h = cell * level.rows;
  const body = Math.round(cell * 0.78);

  const x = useSharedValue(robot.x * cell);
  const y = useSharedValue(robot.y * cell);
  const angle = useSharedValue(robot.angle);
  const shake = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(robot.x * cell, { duration: 260 });
    y.value = withTiming(robot.y * cell, { duration: 260 });
    angle.value = withTiming(robot.angle, { duration: 260 });
  }, [robot.x, robot.y, robot.angle, cell, x, y, angle]);

  useEffect(() => {
    if (bumpKey === 0) return;
    shake.value = withSequence(
      withTiming(cell * 0.12, { duration: 50 }),
      withTiming(-cell * 0.12, { duration: 80 }),
      withTiming(0, { duration: 50 })
    );
  }, [bumpKey, cell, shake]);

  const robotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value + shake.value },
      { translateY: y.value },
      { rotate: `${angle.value}deg` },
    ],
  }));

  const cells = useMemo(
    () => Array.from({ length: level.cols * level.rows }, (_, i) => i),
    [level.cols, level.rows]
  );

  const pos = (cx, cy) => ({ left: cx * cell, top: cy * cell, width: cell, height: cell });

  return (
    <View
      style={[
        styles.frame,
        { width: w, height: h, borderColor: theme.frame, borderRadius: cell * theme.radius },
      ]}
    >
      {cells.map((i) => {
        const cx = i % level.cols;
        const cy = Math.floor(i / level.cols);
        return (
          <View
            key={i}
            style={[
              styles.cell,
              pos(cx, cy),
              {
                backgroundColor: (cx + cy) % 2 ? theme.cellA : theme.cellB,
                borderColor: theme.line,
                borderWidth: theme.line === 'transparent' ? 0 : StyleSheet.hairlineWidth * 2,
              },
            ]}
          />
        );
      })}

      {level.walls.map(([wx, wy]) => (
        <View key={`w${wx}-${wy}`} style={[styles.center, pos(wx, wy)]}>
          <View
            style={[
              styles.block,
              {
                width: cell * 0.86,
                height: cell * 0.86,
                borderRadius: cell * 0.18,
                backgroundColor: theme.wallBg,
                borderColor: theme.wallBorder,
              },
            ]}
          >
            {theme.wallIcon ? (
              <Ionicons name={theme.wallIcon} size={cell * 0.5} color={theme.wallColor} />
            ) : (
              <View style={{ width: cell * 0.42, height: cell * 0.1, borderRadius: cell * 0.05, backgroundColor: theme.wallColor }} />
            )}
          </View>
        </View>
      ))}

      <View style={[styles.center, pos(level.goal.x, level.goal.y)]}>
        <View
          style={[
            styles.block,
            {
              width: cell * 0.86,
              height: cell * 0.86,
              borderRadius: cell * 0.22,
              backgroundColor: theme.goalBg,
              borderColor: theme.goalBorder,
              borderStyle: 'dashed',
            },
          ]}
        >
          <Ionicons name="flag" size={cell * 0.52} color={theme.goalColor} />
        </View>
      </View>

      {/* Robot: a rounded body with a small "nose" arrow showing which way it faces. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.center, { position: 'absolute', left: 0, top: 0, width: cell, height: cell }, robotStyle]}
      >
        <View
          style={[
            styles.block,
            {
              width: body,
              height: body,
              borderRadius: body * 0.28,
              borderWidth: 3,
              backgroundColor: theme.robotBg,
              borderColor: theme.robotBorder,
            },
          ]}
        >
          <Ionicons name="caret-up" size={body * 0.38} color={theme.robotColor} style={styles.nose} />
          <View style={{ flexDirection: 'row', gap: body * 0.1, marginTop: body * 0.12 }}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{
                  width: body * 0.24,
                  height: body * 0.24,
                  borderRadius: body * 0.12,
                  backgroundColor: theme.robotColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ width: body * 0.1, height: body * 0.1, borderRadius: body * 0.05, backgroundColor: '#2B2A33' }} />
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 3, overflow: 'hidden' },
  cell: { position: 'absolute' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  block: { alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  nose: { position: 'absolute', top: -2 },
});
