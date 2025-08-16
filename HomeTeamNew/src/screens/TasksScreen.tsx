import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, List, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks } from '../store';
import { useNavigation } from '@react-navigation/native';

export function TasksScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { items, loading } = useAppSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Görevler</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={item.status ?? ''}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 8 },
});
