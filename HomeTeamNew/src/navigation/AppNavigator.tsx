import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const GroupsStack = createNativeStackNavigator();
function GroupsStackNavigator() {
  return (
    <GroupsStack.Navigator>
      <GroupsStack.Screen name="GroupsList" component={GroupsScreen} options={{ title: 'Gruplar' }} />
      <GroupsStack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Grup Detayı' }} />
    </GroupsStack.Navigator>
  );
}

const TasksStack = createNativeStackNavigator();
function TasksStackNavigator() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksScreen} options={{ title: 'Görevler' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Görev Detayı' }} />
    </TasksStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="GroupsTab" component={GroupsStackNavigator} options={{ title: 'Gruplar' }} />
      <Tab.Screen name="TasksTab" component={TasksStackNavigator} options={{ title: 'Görevler' }} />
    </Tab.Navigator>
  );
}

import { useAppSelector } from '../store/hooks';

export function AppNavigator() {
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = !!token;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
