import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const paperLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C63FF',
  },
};

export const paperDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#9FA8FF',
  },
};
