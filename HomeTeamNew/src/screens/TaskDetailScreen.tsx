import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { tasksApi } from '../services/api';

export function TaskDetailScreen() {
  const route = useRoute<any>();
  const id: string = route.params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;
    tasksApi
      .getById(id)
      .then((res) => {
        const d = res?.data ?? res;
        if (mounted) setData(d);
      })
      .catch((e) => setError(e?.message ?? 'Hata'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <>
          <Text variant="titleLarge">{data?.title ?? 'Görev'}</Text>
          <Text>Durum: {data?.status ?? '-'}</Text>
          <Text>Bitiş: {data?.dueDate ?? '-'}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
