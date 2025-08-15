import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/config/theme';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      <Text style={styles.subtitle}>homeTeam'e hoş geldiniz!</Text>
      <Text style={styles.description}>
        Bu ekranda son görevler, grup aktiviteleri ve özetler gösterilecek.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 16,
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
