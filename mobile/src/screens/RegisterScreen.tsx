import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Text,
  Snackbar,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerAsync } from '../store/slices/authSlice';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setSnackbarMessage('Ad alanı zorunludur');
      return false;
    }
    if (!formData.lastName.trim()) {
      setSnackbarMessage('Soyad alanı zorunludur');
      return false;
    }
    if (!formData.email.trim()) {
      setSnackbarMessage('E-mail alanı zorunludur');
      return false;
    }
    if (!formData.email.includes('@')) {
      setSnackbarMessage('Geçerli bir e-mail adresi girin');
      return false;
    }
    if (formData.password.length < 6) {
      setSnackbarMessage('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setSnackbarMessage('Şifreler eşleşmiyor');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(registerAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      })).unwrap();
      // Navigation will be handled by App.tsx based on auth state
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.cardTitle}>
              Kayıt Ol
            </Text>

            <View style={styles.nameRow}>
              <TextInput
                label="Ad"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                mode="outlined"
                style={[styles.input, styles.nameInput]}
                autoCapitalize="words"
                left={<TextInput.Icon icon="account" />}
              />
              <TextInput
                label="Soyad"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                mode="outlined"
                style={[styles.input, styles.nameInput]}
                autoCapitalize="words"
              />
            </View>

            <TextInput
              label="E-mail"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Telefon (İsteğe bağlı)"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Şifre"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              left={<TextInput.Icon icon="lock" />}
            />

            <TextInput
              label="Şifre Tekrarı"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              left={<TextInput.Icon icon="lock-check" />}
            />

            {error && (
              <Text variant="bodySmall" style={styles.errorText}>
                {error}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Kayıt Ol
            </Button>

            <Text variant="bodyMedium" style={styles.loginText}>
              Zaten hesabın var mı?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.loginButton}
            >
              Giriş Yap
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    marginRight: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});
