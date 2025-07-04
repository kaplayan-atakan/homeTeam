/**
 * homeTeam - Aile Görev Takip Uygulaması
 * SOLID prensiplerine uygun React Native uygulaması
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar, Text, View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

// Basit loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Yükleniyor...</Text>
  </View>
);

// Basit tema
const theme = {
  colors: {
    primary: '#6200EE',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
  },
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#6200EE" 
            translucent={false}
          />
          <RootNavigator />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#6200EE',
    fontWeight: '500',
  },
});

export default App;
