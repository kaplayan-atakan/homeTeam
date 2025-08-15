import React from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';

export default function App() {
  const isHermes = global.HermesInternal != null;
  const isFabric = global?.nativeFabricUIManager != null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>homeTeam (Expo 53 + RN 0.79 + React 19)</Text>
        <Text style={styles.item}>Hermes: {String(isHermes)}</Text>
        <Text style={styles.item}>Fabric: {String(isFabric)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f7f7' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  item: { fontSize: 14, marginTop: 4 },
});
