import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  Snackbar,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, googleLoginAsync } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { googleSignInService, GoogleSigninButton } from '../../services/googleSignIn';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre alanları boş bırakılamaz');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz');
      return;
    }

    try {
      const result = await dispatch(loginAsync({ email: email.trim(), password }));
      
      if (loginAsync.fulfilled.match(result)) {
        // Başarılı giriş - Navigation otomatik olarak değişecek
      } else {
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setSnackbarVisible(true);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleGoogleLogin = async () => {
    try {
      const googleResponse = await googleSignInService.signIn();
      
      // Google'dan alınan idToken'ı backend'e gönder
      const result = await dispatch(googleLoginAsync(googleResponse.idToken));
      
      if (googleLoginAsync.fulfilled.match(result)) {
        // Başarılı giriş - Navigation otomatik olarak değişecek
      } else {
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Google Giriş Hatası', error.message || 'Google ile giriş yapılamadı');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Title style={styles.title}>homeTeam'e Hoş Geldiniz</Title>
          <Text style={styles.subtitle}>
            Aile görevlerinizi kolayca yönetin
          </Text>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

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

              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.dividerText}>veya</Text>
                <Divider style={styles.divider} />
              </View>

              <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  Hesabınız yok mu?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={navigateToRegister}
                  compact
                  disabled={isLoading}
                >
                  Kayıt Ol
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {error || 'Giriş yapılamadı. Lütfen tekrar deneyin.'}
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
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
    color: '#666',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  googleButton: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  snackbar: {
    backgroundColor: '#B00020',
  },
});

export default LoginScreen;
