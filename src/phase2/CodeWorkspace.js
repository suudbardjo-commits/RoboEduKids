import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { night, fonts } from '../theme';
import { StickerButton } from '../components/Sticker';
import { BLOCK_DEFS, CATEGORIES, CATEGORY_BY_ID, DEF_BY_ID, labelOf } from './blockDefs';
import { usePhase2Store } from './store';
import { startRun } from './runner';
import { playSfx } from '../audio';
import ScratchBlock from './ScratchBlock';

export const CANVAS_COLOR = night.bg;

/**
 * Isi bottom sheet, disusun dari atas ke bawah memakai seluruh lebar layar:
 *   1. Tab kategori (empat tab sejajar, tidak ada sidebar yang memakan lebar)
 *   2. Palet blok kategori terpilih: semua blok langsung terlihat, tidak perlu digeser
 *   3. Bilah kode: jumlah blok, hapus semua, JALANKAN
 *   4. Tumpukan blok kode (bisa digulir ke bawah)
 */
export default function CodeWorkspace({ bottomPad }) {
  const blocks = usePhase2Store((s) => s.blocks);
  const category = usePhase2Store((s) => s.category);
  const status = usePhase2Store((s) => s.status);
  const runningUid = usePhase2Store((s) => s.runningUid);
  const setCategory = usePhase2Store((s) => s.setCategory);
  const addBlock = usePhase2Store((s) => s.addBlock);
  const removeBlock = usePhase2Store((s) => s.removeBlock);
  const cycleVal = usePhase2Store((s) => s.cycleVal);
  const clearBlocks = usePhase2Store((s) => s.clearBlocks);

  const cat = CATEGORY_BY_ID[category];
  const palette = BLOCK_DEFS.filter((d) => d.cat === category);
  const running = status === 'running';

  return (
    <View style={styles.root}>
      {/* 1. Tab kategori */}
      <View style={styles.tabs}>
        {CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`Kategori ${c.label}`}
              accessibilityState={{ selected: active }}
              style={[styles.tab, active ? { backgroundColor: c.color, borderColor: c.color } : styles.tabOff]}
            >
              <Ionicons name={c.icon} size={20} color={active ? night.bg : night.chalkDim} />
              <Text style={[styles.tabText, { color: active ? night.bg : night.chalkDim }]} numberOfLines={1}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Palet: semua blok kategori ini, dibungkus ke baris berikutnya bila tidak muat */}
      <View style={styles.palette}>
        {palette.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => {
              playSfx('tambah');
              addBlock(d.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Tambah blok ${labelOf(d)}`}
            style={[styles.chip, { borderColor: cat.color }]}
          >
            <Ionicons name="add-circle" size={18} color={cat.color} />
            <Text style={styles.chipText}>{labelOf(d)}</Text>
          </Pressable>
        ))}
      </View>

      {/* 3. Bilah kode */}
      <View style={styles.bar}>
        <Text style={styles.barTitle}>
          Kodemu <Text style={styles.barCount}>({blocks.length} blok)</Text>
        </Text>
        <View style={styles.barBtns}>
          <Pressable
            onPress={clearBlocks}
            hitSlop={10}
            disabled={running || blocks.length === 0}
            accessibilityRole="button"
            accessibilityLabel="Hapus semua blok"
            style={[styles.trash, (running || blocks.length === 0) && { opacity: 0.4 }]}
          >
            <Ionicons name="trash-outline" size={22} color={night.chalk} />
          </Pressable>
          <StickerButton
            onPress={startRun}
            disabled={running}
            label={running ? 'Kode sedang berjalan' : 'Jalankan kode'}
            bg={night.tomato}
            ink={night.chalk}
            shadow="#0B0C10"
            radius={12}
            depth={3}
            k={0}
            faceStyle={[styles.run, running && { opacity: 0.6 }]}
          >
            <Ionicons name={running ? 'hourglass' : 'play'} size={16} color="#FFFFFF" />
            <Text style={styles.runText}>{running ? 'Jalan...' : 'JALANKAN'}</Text>
          </StickerButton>
        </View>
      </View>

      {/* 4. Tumpukan blok kode */}
      <View style={styles.canvas}>
        <BottomSheetScrollView
          contentContainerStyle={[styles.stack, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          {blocks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Belum ada blok</Text>
              <Text style={styles.empty}>
                Ketuk satu blok di atas. Mulailah dari "saat JALANKAN ditekan" di tab Kejadian.
              </Text>
            </View>
          ) : (
            blocks.map((b) => (
              <ScratchBlock
                key={b.uid}
                def={DEF_BY_ID[b.defId]}
                vals={b.vals}
                running={runningUid === b.uid}
                canvasColor={CANVAS_COLOR}
                onCycle={(k) => cycleVal(b.uid, k)}
                onRemove={() => removeBlock(b.uid)}
              />
            ))
          )}
          {blocks.length > 0 && (
            <Text style={styles.hint}>
              "ulangi" dan "jika" berlaku untuk blok tepat di bawahnya. Ketuk angka di dalam blok untuk menggantinya.
            </Text>
          )}
        </BottomSheetScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingTop: 2, paddingBottom: 6 },
  tab: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    borderRadius: 12,
    borderWidth: 2,
  },
  tabOff: { backgroundColor: night.panelHi, borderColor: night.panelHi },
  tabText: { fontSize: 13, fontFamily: fonts.bodyHeavy },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: night.panelHi,
  },
  chipText: { fontSize: 14, fontFamily: fonts.bodyHeavy, color: night.chalk },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopWidth: 2,
    borderTopColor: night.panelHi,
    backgroundColor: night.panel,
  },
  barTitle: { color: night.chalk, fontSize: 22, fontFamily: fonts.hand },
  barCount: { color: night.chalkDim, fontSize: 16, fontFamily: fonts.body },
  barBtns: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trash: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  run: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 44 },
  runText: { color: '#FFFFFF', fontSize: 18, fontFamily: fonts.hand, letterSpacing: 0.5 },
  canvas: { flex: 1, backgroundColor: CANVAS_COLOR, overflow: 'hidden' },
  stack: { padding: 12, paddingTop: 12 },
  emptyBox: { marginTop: 12, gap: 6 },
  emptyTitle: { color: night.chalk, fontSize: 22, fontFamily: fonts.hand },
  empty: { color: night.chalkDim, fontSize: 14, lineHeight: 20, fontFamily: fonts.body },
  hint: { color: night.chalkDim, fontSize: 12, marginTop: 18, lineHeight: 17, fontFamily: fonts.body },
});
