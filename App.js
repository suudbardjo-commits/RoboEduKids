import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { paper } from './src/theme';

export default function App() {
  const [loaded, error] = useFonts({ PatrickHand_400Regular, Nunito_700Bold, Nunito_800ExtraBold });

  // Jika huruf gagal dimuat, tetap jalan dengan huruf sistem: lebih baik tampil sederhana daripada layar kosong.
  if (!loaded && !error) return <View style={styles.boot} />;

  return (
    // GestureHandlerRootView dibutuhkan gesture-handler, seret blok Fase 1, dan bottom sheet Fase 2.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: { flex: 1, backgroundColor: paper.paper },
});
