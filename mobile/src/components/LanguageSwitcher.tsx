import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageSwitcherProps {
  style?: any;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('selected_language', language);
      closeMenu();
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'en' 
      ? t('settings.languages.en') 
      : t('settings.languages.tr');
  };

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            icon="earth"
            contentStyle={styles.buttonContent}
          >
            {getCurrentLanguageLabel()}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          onPress={() => changeLanguage('tr')}
          title={t('settings.languages.tr')}
          leadingIcon="flag"
          titleStyle={i18n.language === 'tr' ? styles.activeLanguage : {}}
        />
        <Menu.Item
          onPress={() => changeLanguage('en')}
          title={t('settings.languages.en')}
          leadingIcon="flag-outline"
          titleStyle={i18n.language === 'en' ? styles.activeLanguage : {}}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContent: {
    paddingHorizontal: 8,
  },
  menuContent: {
    marginTop: 8,
  },
  activeLanguage: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

export default LanguageSwitcher;