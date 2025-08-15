import { DefaultTheme } from 'react-native-paper';

// Renk paleti
export const colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
  
  // Status colors
  statusPending: '#FFC107',
  statusInProgress: '#2196F3',
  statusCompleted: '#4CAF50',
  statusCancelled: '#F44336',
  
  // Priority colors
  priorityLow: '#4CAF50',
  priorityMedium: '#FF9800',
  priorityHigh: '#FF5722',
  priorityUrgent: '#F44336',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
};

// Spacing sistemi
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Shadow styles
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Paper theme
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    disabled: colors.textDisabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Dark theme için renk paleti
export const darkColors = {
  ...colors,
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textDisabled: '#666666',
};

// Dark paper theme
export const darkPaperTheme = {
  ...paperTheme,
  dark: true,
  colors: {
    ...paperTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    text: darkColors.textPrimary,
    disabled: darkColors.textDisabled,
    placeholder: darkColors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
};

// Theme interface
export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

// Light theme
export const lightTheme: Theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

// Dark theme
export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
};
