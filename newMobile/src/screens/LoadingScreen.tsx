import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/config/theme';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>homeTeam</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.subtitle}>Yükleniyor...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginVertical: spacing.md,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
});

export default LoadingScreen;
