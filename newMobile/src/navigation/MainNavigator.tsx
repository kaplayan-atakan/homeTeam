import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { MainTabParamList } from '@/types';

// Import screens (şimdilik placeholder)
import HomeScreen from '@/screens/main/HomeScreen';
import TasksScreen from '@/screens/main/TasksScreen';
import GroupsScreen from '@/screens/main/GroupsScreen';
import NotificationsScreen from '@/screens/main/NotificationsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator();

// Tab Navigator
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Tasks':
              iconName = 'assignment';
              break;
            case 'Groups':
              iconName = 'group';
              break;
            case 'Notifications':
              iconName = 'notifications';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Görevler' }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{ title: 'Gruplar' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator with Stack for modal screens
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      {/* Modal screens can be added here */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
