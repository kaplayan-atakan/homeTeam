/**
 * homeTeam - Aile Görev Takip Uygulaması
 * SOLID prensiplerine uygun React Native uygulaması
 */

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { store, persistor } from './src/store';
import { InitSplashScreen } from './src/screens/InitSplashScreen';
import RootNavigator from './src/navigation/RootNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { firebaseNotificationService } from './src/services/firebaseNotificationService';

// App wrapper component
const AppContent: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Firebase notifications başlatma
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await firebaseNotificationService.initialize();
        console.log('Firebase notifications initialized successfully');
      } catch (error) {
        console.error('Firebase notifications initialization failed:', error);
      }
    };

    initializeFirebase();
  }, []);

  const handleInitialization = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    setIsInitialized(true);
  };

  if (!isInitialized) {
    return <InitSplashScreen onInitialized={handleInitialization} />;
  }

  return isAuthenticated ? <RootNavigator /> : <AuthNavigator />;
};

// Tema konfigürasyonu
const theme = {
  colors: {
    primary: '#2196F3',
    primaryContainer: '#BBDEFB',
    secondary: '#03DAC6',
    secondaryContainer: '#B2DFDB',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#B00020',
    errorContainer: '#FDEAEA',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
    onError: '#FFFFFF',
    outline: '#79747E',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#A8C7FA',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: 'rgba(0, 0, 0, 0.12)',
    onSurfaceDisabled: 'rgba(0, 0, 0, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<InitSplashScreen onInitialized={() => {}} />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#2196F3" 
            translucent={false}
          />
          <AppContent />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
