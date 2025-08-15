import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
            🏠 homeTeam Mobile
          </Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
            Aile Görev Takip Uygulaması
          </Text>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
              ✅ Özellikler
            </Text>
            <Text style={[styles.sectionText, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
              • React Native 0.72+ ile TypeScript{'\n'}
              • Redux Toolkit ile state management{'\n'}
              • React Navigation v6 ile navigation{'\n'}
              • Socket.IO ile gerçek zamanlı iletişim{'\n'}
              • Firebase entegrasyonu{'\n'}
              • Offline support
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
              🚀 Durum
            </Text>
            <Text style={[styles.sectionText, {color: '#4CAF50'}]}>
              ✅ Proje başarıyla çalışıyor!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default App;
