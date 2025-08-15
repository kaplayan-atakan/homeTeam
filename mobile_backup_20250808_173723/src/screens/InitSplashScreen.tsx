import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useAppDispatch } from '../store/hooks';
import { verifyTokenAsync } from '../store/slices/authSlice';

interface InitSplashScreenProps {
  onInitialized: (isAuthenticated: boolean) => void;
}

export const InitSplashScreen: React.FC<InitSplashScreenProps> = ({ onInitialized }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Token'ı doğrula
        await dispatch(verifyTokenAsync()).unwrap();
        onInitialized(true);
      } catch (error) {
        // Token geçersiz veya yok
        onInitialized(false);
      }
    };

    // Minimum splash süresini sağlamak için
    const timer = setTimeout(initializeApp, 1500);
    return () => clearTimeout(timer);
  }, [dispatch, onInitialized]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text variant="headlineLarge" style={styles.title}>
            🏠
          </Text>
          <Text variant="headlineMedium" style={styles.appName}>
            homeTeam
          </Text>
        </View>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          Aile görev takip sistemi
        </Text>
        
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.loader}
        />
        
        <Text variant="bodySmall" style={styles.loadingText}>
          Yükleniyor...
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          v1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
  },
  footer: {
    paddingBottom: 32,
  },
  version: {
    color: '#999',
  },
});
