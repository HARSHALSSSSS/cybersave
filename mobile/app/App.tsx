import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  ThemeProvider,
  QueryProvider,
  StoreProvider,
  LanguageSyncProvider,
  useTheme,
} from './providers';
import { LanguageBootstrap } from './providers/LanguageBootstrap';
import { ApiWarmup } from './providers/ApiWarmup';
import { RootNavigator } from './navigation';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <LanguageBootstrap>
      <>
        <ApiWarmup />
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </>
    </LanguageBootstrap>
  );
};

const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StoreProvider>
        <QueryProvider>
          <LanguageSyncProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </LanguageSyncProvider>
        </QueryProvider>
      </StoreProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
