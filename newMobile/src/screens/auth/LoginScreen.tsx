import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';
import type { AuthStackParamList } from '@/types';
import { colors, typography, spacing } from '@/config/theme';
import { REGEX_PATTERNS } from '@/config/constants';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const validateForm = (): boolean => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('E-posta adresi gereklidir');
      isValid = false;
    } else if (!REGEX_PATTERNS.EMAIL.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Şifre gereklidir');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      // Navigation will be handled by RootNavigator based on auth state
    } catch (err) {
      Alert.alert('Hata', error || 'Giriş yapılırken bir hata oluştu');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresinizi giriniz"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifrenizi giriniz"
              secureTextEntry
              autoComplete="password"
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey300,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.grey400,
  },
  loginButtonText: {
    ...typography.h6,
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
