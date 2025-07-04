import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import GroupListScreen from '../screens/groups/GroupListScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Stack Navigators
const AuthStack = createStackNavigator();
const TaskStack = createStackNavigator();
const GroupStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Giriş Yap' }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Kayıt Ol' }}
      />
    </AuthStack.Navigator>
  );
}

// Task Stack Navigator
function TaskStackNavigator() {
  return (
    <TaskStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <TaskStack.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ title: 'Görevlerim' }}
      />
      <TaskStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Görev Detayı' }}
      />
      <TaskStack.Screen 
        name="CreateTask" 
        component={CreateTaskScreen} 
        options={{ title: 'Yeni Görev' }}
      />
    </TaskStack.Navigator>
  );
}

// Group Stack Navigator
function GroupStackNavigator() {
  return (
    <GroupStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <GroupStack.Screen 
        name="GroupList" 
        component={GroupListScreen} 
        options={{ title: 'Gruplarım' }}
      />
      <GroupStack.Screen 
        name="GroupDetail" 
        component={GroupDetailScreen} 
        options={{ title: 'Grup Detayı' }}
      />
    </GroupStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profilim' }}
      />
      <ProfileStack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Bildirimler' }}
      />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Tasks':
              iconName = 'assignment';
              break;
            case 'Groups':
              iconName = 'group';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Anasayfa' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TaskStackNavigator} 
        options={{ tabBarLabel: 'Görevler' }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupStackNavigator} 
        options={{ tabBarLabel: 'Gruplar' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

export default RootNavigator;
