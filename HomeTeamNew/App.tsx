import 'react-native-gesture-handler';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { persistor, store } from './src/store';
import { tokenManager, bindStore } from './src/services/api';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperDark, paperLight } from './src/theme/paperTheme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
        onBeforeLift={() => {
          bindStore(store);
          const state: any = store.getState();
          const token = state?.auth?.token ?? null;
          const rToken = state?.auth?.refreshToken ?? null;
          tokenManager.setTokens(token, rToken);
        }}
      >
        <SafeAreaProvider>
          <PaperProvider theme={isDarkMode ? paperDark : paperLight}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
              <View style={styles.container}>
                <AppNavigator />
              </View>
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
