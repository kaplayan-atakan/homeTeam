/**
 * homeTeam - Aile Görev Takip Uygulaması
 * SOLID prensiplerine uygun React Native uygulaması
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { theme } from './src/config/theme';
import LoadingScreen from './src/components/LoadingScreen';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar 
                barStyle="dark-content" 
                backgroundColor={theme.colors.primary} 
              />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
