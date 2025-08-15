import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Title, Text, Avatar } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyTokenAsync } from '../store/slices/authSlice';

interface SplashScreenProps {
  navigation: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Token'ı doğrula
        await dispatch(verifyTokenAsync());
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    // Loading tamamlandığında yönlendirme yap
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }, 1000); // 1 saniye bekle (splash effect için)

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Avatar.Icon 
          size={120} 
          icon="home" 
          style={styles.logo}
        />
        <Title style={styles.title}>homeTeam</Title>
        <Text style={styles.subtitle}>Aile Görev Takip Sistemi</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color="#6200ee" 
            style={styles.loader}
          />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200ee',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loader: {
    marginBottom: 15,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  version: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});

export default SplashScreen;
