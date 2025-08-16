import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { darkPaperTheme, paperTheme } from '@/config/theme';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={isDarkMode ? darkPaperTheme : paperTheme}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
