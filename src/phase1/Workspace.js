import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { paper, fonts, wob } from '../theme';
import Robo from '../components/Robo';
import { Sticker, StickerButton } from '../components/Sticker';

import { BLOCKS, LEVEL_COUNT } from './blocks';
import { LEVELS, starsFor } from './levels';
import { simulate } from './engine';
import { usePhase1Store } from './store';
import { feedbackBump, feedbackLose, feedbackStep, feedbackTap, feedbackWin } from './feedback';
import { initialRobot } from '../engine/grid';
import GridBoard, { PLAYFUL } from '../engine/GridBoard';
import { DragProvider } from './DragContext';
import TopBar from './TopBar';
import Canvas from './Canvas';
import TrashBin from './TrashBin';
import Tray from './Tray';

const STEP_MS = 520;

/** Layar satu level: papan robot + kanvas drag & drop + tray blok. */
export default function Workspace({ level, onExit, onNext }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Sizes come from the SHORT side so they stay correct while the device is still rotating.
  const short = Math.min(width, height);
  const blockSize = Math.max(56, Math.min(96, Math.round(short * 0.18)));
  const cellSize = Math.round(blockSize * 0.8);
  const data = LEVELS[level - 1];

  const program = usePhase1Store((s) => s.program);
  const audioOn = usePhase1Store((s) => s.audioOn);
  const addBlock = usePhase1Store((s) => s.addBlock);
  const removeAt = usePhase1Store((s) => s.removeAt);
  const clearProgram = usePhase1Store((s) => s.clearProgram);
  const toggleAudio = usePhase1Store((s) => s.toggleAudio);
  const finishLevel = usePhase1Store((s) => s.finishLevel);

  const [robot, setRobot] = useState(() => initialRobot(data));
  const [bumpKey, setBumpKey] = useState(0);
  const [step, setStep] = useState(-1);
  const [status, setStatus] = useState('idle'); // idle | running | won | lost
  const [earned, setEarned] = useState(0);
  const [mid, setMid] = useState({ w: 0, h: 0 });
  const [hint, setHint] = useState(false); // "isi blok dulu" saat MAIN ditekan dengan program kosong
  const timer = useRef(null);
  const hintTimer = useRef(null);

  useEffect(() => {
    clearProgram();
    return () => {
      clearTimeout(timer.current);
      clearTimeout(hintTimer.current);
    };
  }, [clearProgram]);

  const resetRobot = useCallback(() => {
    clearTimeout(timer.current);
    setRobot(initialRobot(data));
    setStep(-1);
    setStatus('idle');
  }, [data]);

  /** Dipanggil DraggableBlock saat blok dilepas (thread JS). */
  const handleDrop = useCallback(
    (typeIndex, srcIndex, insideCanvas) => {
      if (status === 'running') return;
      if (status !== 'idle') resetRobot();
      if (srcIndex === -1) {
        if (insideCanvas) {
          addBlock(BLOCKS[typeIndex].id);
          feedbackTap();
        }
      } else if (!insideCanvas) {
        removeAt(srcIndex);
        feedbackTap();
      }
    },
    [status, resetRobot, addBlock, removeAt]
  );

  const play = () => {
    if (status === 'running') return;
    if (program.length === 0) {
      // Tanpa umpan balik, MAIN terasa "mati" saat program masih kosong.
      setHint(true);
      clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setHint(false), 2500);
      return;
    }
    const sim = simulate(data, program);
    setStatus('running');
    let i = 0;
    const tick = () => {
      if (i >= sim.states.length) {
        if (sim.won) {
          const n = starsFor(data, program.length);
          setEarned(n);
          finishLevel(level, n);
          setStatus('won');
          feedbackWin();
        } else {
          setStatus('lost');
          feedbackLose();
          timer.current = setTimeout(resetRobot, 1800);
        }
        setStep(-1);
        return;
      }
      const st = sim.states[i];
      setRobot(st.robot);
      setStep(st.idx);
      if (st.bump) {
        setBumpKey((k) => k + 1);
        feedbackBump();
      } else {
        feedbackStep();
      }
      i += 1;
      timer.current = setTimeout(tick, STEP_MS);
    };
    tick();
  };

  const startOver = () => {
    resetRobot();
    clearProgram();
  };

  const topSize = Math.round(blockSize * 0.62);
  const boardSide = Math.max(0, Math.min(mid.h, mid.w * 0.36));

  return (
    <View
      style={[
        styles.root,
        { paddingLeft: insets.left + 16, paddingRight: insets.right + 16, paddingTop: Math.max(insets.top, 4) },
      ]}
    >
      <DragProvider ghostSize={blockSize} style={styles.fill}>
        <TopBar
          level={level}
          size={topSize}
          playing={status === 'running'}
          audioOn={audioOn}
          onBack={onExit}
          onPlay={play}
          onToggleAudio={toggleAudio}
        />

        <View style={styles.middle} onLayout={(e) => setMid({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          <View style={[styles.boardWrap, { width: boardSide }]}>
            {boardSide > 0 && (
              <GridBoard
                level={data}
                robot={robot}
                bumpKey={bumpKey}
                availW={boardSide}
                availH={boardSide}
                theme={PLAYFUL}
              />
            )}
          </View>
          <Canvas program={program} cellSize={cellSize} playingIndex={step} onDrop={handleDrop} />
          <View style={[styles.binCol, { width: blockSize * 0.95 }]}>
            <TrashBin width={blockSize * 0.8} />
            <StickerButton
              onPress={startOver}
              label="Kosongkan program dan mulai ulang"
              bg={paper.white}
              radius={blockSize * 0.2}
              depth={3}
              k={1}
              faceStyle={{ width: blockSize * 0.62, height: blockSize * 0.62, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="refresh" size={blockSize * 0.34} color={paper.ink} />
            </StickerButton>
          </View>

          {(status === 'lost' || hint) && (
            <View pointerEvents="none" style={styles.toast}>
              <Text style={styles.toastText}>
                {hint ? 'Ketuk atau seret blok ke kotak tengah dulu ya!' : 'Ups, robot belum sampai! Coba lagi ya.'}
              </Text>
            </View>
          )}
        </View>

        <Tray blockSize={blockSize} bottomInset={Math.max(insets.bottom, 8)} onDrop={handleDrop} />

      </DragProvider>
      {status === 'won' && (
        <View style={styles.win}>
          <Sticker bg={paper.paper} radius={30} depth={7} k={0} style={{ maxWidth: 560 }} faceStyle={styles.winCard}>
            <View style={styles.winRobo}>
              <Robo size={Math.min(150, blockSize * 1.7)} />
            </View>
            <View style={styles.winBody}>
              <Text style={styles.winTitle}>Robo sampai! Level {level} selesai</Text>
              <View style={styles.starRow}>
                {[1, 2, 3].map((n) => (
                  <Ionicons
                    key={n}
                    name={n <= earned ? 'star' : 'star-outline'}
                    size={blockSize * 0.62}
                    color={n <= earned ? paper.mustard : paper.ink}
                  />
                ))}
              </View>
              <Text style={styles.winSub}>
                {earned === 3 ? 'Tiga bintang. Kamu memakai blok paling sedikit.' : 'Coba pakai blok lebih sedikit untuk dapat tiga bintang.'}
              </Text>
              <View style={styles.winBtns}>
                <StickerButton onPress={onExit} label="Kembali ke peta level" bg={paper.paperDeep} radius={20} depth={4} k={1} faceStyle={styles.btn}>
                  <Ionicons name="map" size={20} color={paper.ink} />
                  <Text style={styles.btnText}>Peta</Text>
                </StickerButton>
                <StickerButton onPress={resetRobot} label="Ulangi level ini" bg={paper.paperDeep} radius={20} depth={4} k={2} faceStyle={styles.btn}>
                  <Ionicons name="refresh" size={20} color={paper.ink} />
                  <Text style={styles.btnText}>Ulangi</Text>
                </StickerButton>
                {level < LEVEL_COUNT && (
                  <StickerButton onPress={() => onNext(level + 1)} label="Lanjut ke level berikutnya" bg={paper.tomato} radius={20} depth={4} k={3} faceStyle={styles.btn}>
                    <Text style={[styles.btnText, { color: paper.white }]}>Lanjut</Text>
                    <Ionicons name="play" size={20} color={paper.white} />
                  </StickerButton>
                )}
              </View>
            </View>
          </Sticker>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: paper.paper },
  fill: { flex: 1 },
  middle: { flex: 1, flexDirection: 'row', alignItems: 'stretch', gap: 12, marginBottom: 12 },
  boardWrap: { justifyContent: 'center', flexShrink: 0 },
  binCol: { alignSelf: 'stretch', justifyContent: 'space-evenly', alignItems: 'center' },
  toast: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
    left: '26%',
    right: '26%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...wob(16, 2),
    backgroundColor: paper.ink,
  },
  toastText: { color: paper.paper, fontFamily: fonts.hand, textAlign: 'center', fontSize: 17 },
  win: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(43,42,51,0.55)',
    padding: 16,
  },
  winCard: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  winRobo: { alignItems: 'center', justifyContent: 'center' },
  winBody: { flexShrink: 1, alignItems: 'flex-start', gap: 6 },
  winTitle: { fontFamily: fonts.hand, fontSize: 28, lineHeight: 32, color: paper.ink },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  winSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: paper.ink },
  winBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, minHeight: 48 },
  btnText: { fontFamily: fonts.hand, fontSize: 20, color: paper.ink },
});
