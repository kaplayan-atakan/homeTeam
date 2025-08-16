import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Home</Text>
      <Text>Dashboard & activity overview will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});
