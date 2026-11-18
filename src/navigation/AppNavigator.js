import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import IntroScreen from '../screens/IntroScreen';
import Phase1Screen from '../screens/Phase1Screen';
import Phase2Screen from '../screens/Phase2Screen';
import { useSettings } from '../settings/store';
import { paper } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Tunggu pengaturan tersimpan terbaca, supaya anak yang sudah pernah masuk tidak melihat landing sekilas.
  const [hydrated, setHydrated] = useState(useSettings.persist.hasHydrated());
  const seenIntro = useSettings((s) => s.seenIntro);

  useEffect(() => {
    if (hydrated) return undefined;
    return useSettings.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: paper.paper }} />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Hanya dipakai saat navigator pertama kali dibuat: landing muncul sekali saat pertama membuka aplikasi.
        initialRouteName={seenIntro ? 'Home' : 'Intro'}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} options={{ orientation: 'portrait' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ orientation: 'portrait' }} />
        <Stack.Screen name="Phase1" component={Phase1Screen} options={{ orientation: 'landscape' }} />
        <Stack.Screen name="Phase2" component={Phase2Screen} options={{ orientation: 'portrait' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
