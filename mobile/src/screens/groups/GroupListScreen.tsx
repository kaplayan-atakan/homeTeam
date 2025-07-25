import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

interface GroupListScreenProps {
  navigation: any;
}

const GroupListScreen: React.FC<GroupListScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Gruplarım
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Bu ekran henüz geliştirilme aşamasındadır.
          </Text>
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
    marginBottom: 16,
    color: '#6200EE',
  },
  description: {
    marginBottom: 24,
    color: '#666',
  },
});

export default GroupListScreen;
