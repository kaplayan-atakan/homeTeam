import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Title,
  List,
  Divider,
  Switch,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Language Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{t('settings.language')}</Title>
          <Text style={styles.description}>
            {t('settings.language')} seçeneklerini buradan değiştirebilirsiniz.
          </Text>
          <View style={styles.languageSwitcherContainer}>
            <LanguageSwitcher />
          </View>
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{t('settings.notifications')}</Title>
          
          <List.Item
            title={t('settings.pushNotifications')}
            right={() => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.emailNotifications')}
            right={() => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.soundEnabled')}
            right={() => (
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* General Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{t('settings.general')}</Title>
          
          <List.Item
            title={t('common.profile')}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Profile')}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.privacy')}
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to privacy settings */}}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.about')}
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to about screen */}}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  description: {
    color: '#666',
    marginBottom: 16,
    fontSize: 14,
  },
  languageSwitcherContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});

export default SettingsScreen;