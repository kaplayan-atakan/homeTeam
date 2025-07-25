import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Card,
  Avatar,
  Surface,
  HelperText,
  Divider,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginAsync } from '../store/slices/authSlice';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { isLoading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email adresi gereklidir');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Geçerli bir email adresi giriniz');
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
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginAsync({ email: email.trim(), password }));
      
      if (loginAsync.fulfilled.match(result)) {
        // Login başarılı, ana sayfaya yönlendir
        navigation.replace('Main');
      } else {
        // Login başarısız, hata mesajını göster
        Alert.alert('Giriş Hatası', result.payload as string);
      }
    } catch (error) {
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.surface}>
          {/* Header */}
          <View style={styles.header}>
            <Avatar.Icon size={80} icon="home" style={styles.logo} />
            <Title style={styles.title}>homeTeam</Title>
            <Text style={styles.subtitle}>Aile Görev Takip Sistemi</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={!!emailError}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>

                <TextInput
                  label="Şifre"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!passwordError}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>

                {error && (
                  <HelperText type="error" visible>
                    {error}
                  </HelperText>
                )}

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                >
                  Giriş Yap
                </Button>

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                >
                  Şifremi Unuttum
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Register Section */}
          <View style={styles.registerSection}>
            <Divider style={styles.divider} />
            <Text style={styles.registerText}>Hesabınız yok mu?</Text>
            <Button
              mode="outlined"
              onPress={handleRegister}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Hesap Oluştur
            </Button>
          </View>
        </Surface>
      </ScrollView>
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
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    elevation: 4,
    borderRadius: 12,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    backgroundColor: '#6200ee',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 2,
    marginBottom: 20,
  },
  form: {
    paddingTop: 10,
  },
  input: {
    marginBottom: 5,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginBottom: 10,
  },
  registerSection: {
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  registerButton: {
    minWidth: 200,
  },
});

export default LoginScreen;
