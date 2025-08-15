import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/config/theme';

const RegisterScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Oluştur</Text>
      <Text style={styles.subtitle}>Bu ekran geliştirilecek</Text>
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
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
});

export default RegisterScreen;
