import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, List, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGroups } from '../store';
import { useNavigation } from '@react-navigation/native';

export function GroupsScreen() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.groups);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Gruplar</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`Üye: ${item.membersCount ?? '-'}`}
              onPress={() => navigation.navigate('GroupDetail', { id: item.id })}
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
