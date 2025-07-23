import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            title: t('auth.loginTitle'),
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            title: t('auth.registerTitle'),
            headerShown: true,
            headerBackTitle: t('common.back'),
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{
            title: t('auth.forgotPasswordTitle'),
            headerShown: true,
            headerBackTitle: t('common.back'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
