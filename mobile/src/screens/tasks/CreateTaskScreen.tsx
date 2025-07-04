import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

interface CreateTaskScreenProps {
  navigation: any;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Yeni Görev Oluştur
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Bu ekran henüz geliştirilme aşamasındadır.
          </Text>
          
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Geri Dön
          </Button>
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
  button: {
    marginTop: 16,
  },
});

export default CreateTaskScreen;
