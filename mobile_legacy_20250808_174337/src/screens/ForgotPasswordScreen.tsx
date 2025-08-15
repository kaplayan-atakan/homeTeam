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
import { authService } from '../services/authService';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSnackbarMessage('E-mail adresi gereklidir');
      setSnackbarVisible(true);
      return;
    }

    if (!email.includes('@')) {
      setSnackbarMessage('Geçerli bir e-mail adresi girin');
      setSnackbarVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setIsSuccess(true);
      setSnackbarMessage('Şifre sıfırlama bağlantısı e-mail adresinize gönderildi');
      setSnackbarVisible(true);
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
              Şifremi Unuttum
            </Text>

            <Text variant="bodyMedium" style={styles.description}>
              E-mail adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </Text>

            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
              disabled={isSuccess}
            />

            {!isSuccess ? (
              <Button
                mode="contained"
                onPress={handleForgotPassword}
                style={styles.resetButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>
            ) : (
              <View style={styles.successContainer}>
                <Text variant="bodyMedium" style={styles.successText}>
                  ✅ E-mail gönderildi! E-mail kutunuzu kontrol edin.
                </Text>
                <Text variant="bodySmall" style={styles.instructionText}>
                  E-mail'i görmüyorsanız spam/gereksiz klasörünü kontrol edin.
                </Text>
              </View>
            )}

            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.backButton}
            >
              Giriş Sayfasına Dön
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
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
    marginBottom: 16,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 16,
  },
  successContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  successText: {
    textAlign: 'center',
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: '500',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  backButton: {
    marginTop: 8,
  },
});
