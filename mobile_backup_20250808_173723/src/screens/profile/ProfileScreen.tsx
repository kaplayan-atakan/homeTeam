import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAsync } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Profilim
          </Text>
          
          {user && (
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user.email}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={navigateToNotifications}
              style={styles.actionButton}
              icon="bell"
            >
              Bildirimler
            </Button>

            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              loading={isLoading}
              icon="logout"
            >
              Çıkış Yap
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    color: '#6200EE',
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#B00020',
  },
});

export default ProfileScreen;
