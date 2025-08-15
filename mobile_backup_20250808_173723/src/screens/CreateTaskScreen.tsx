import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Chip,
  Switch,
  Divider,
  Menu,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { TaskPriority, CreateTaskDto } from '../types/task.types';

interface CreateTaskScreenProps {
  navigation: any;
  route: any;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(new Date());
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [slaMinutes, setSlaMinutes] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [musicIntegration, setMusicIntegration] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const { groups } = useSelector((state: RootState) => state.groups);
  const dispatch = useDispatch();

  // Route'dan gelen parametreleri kontrol et
  useEffect(() => {
    if (route.params?.groupId) {
      setSelectedGroupId(route.params.groupId);
    }
    if (route.params?.assignedTo) {
      setAssignedToId(route.params.assignedTo);
    }
  }, [route.params]);

  const selectedGroup = groups.find((group: any) => group.id === selectedGroupId);
  const groupMembers = selectedGroup?.members || [];

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı zorunludur');
      return;
    }

    if (!selectedGroupId) {
      Alert.alert('Hata', 'Lütfen bir grup seçin');
      return;
    }

    if (!assignedToId) {
      Alert.alert('Hata', 'Lütfen görevi atayacağınız kişiyi seçin');
      return;
    }

    setLoading(true);
    try {
      const createTaskDto: CreateTaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignedTo: assignedToId,
        groupId: selectedGroupId,
        dueDate: dueDate.toISOString(),
        slaMinutes: slaMinutes ? parseInt(slaMinutes) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        musicIntegration: musicIntegration ? {
          autoPlay: true,
          playlistId: 'default', // Varsayılan playlist
        } : undefined,
      };

      // API çağrısı burada yapılacak
      // await dispatch(createTask(createTaskDto));
      
      Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Görev oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const getPriorityDisplayName = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Düşük';
      case TaskPriority.MEDIUM:
        return 'Orta';
      case TaskPriority.HIGH:
        return 'Yüksek';
      case TaskPriority.URGENT:
        return 'Acil';
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return '#F44336';
      case TaskPriority.HIGH:
        return '#FF9800';
      case TaskPriority.MEDIUM:
        return '#2196F3';
      case TaskPriority.LOW:
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Yeni Görev Oluştur</Title>
          
          {/* Görev Başlığı */}
          <TextInput
            label="Görev Başlığı *"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
            maxLength={100}
          />

          {/* Açıklama */}
          <TextInput
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {/* Öncelik */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Öncelik</Text>
            <Menu
              visible={priorityMenuVisible}
              onDismiss={() => setPriorityMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setPriorityMenuVisible(true)}
                  style={[styles.menuButton, { borderColor: getPriorityColor(priority) }]}
                  labelStyle={{ color: getPriorityColor(priority) }}
                >
                  {getPriorityDisplayName(priority)}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setPriority(TaskPriority.LOW);
                  setPriorityMenuVisible(false);
                }}
                title="Düşük"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setPriority(TaskPriority.MEDIUM);
                  setPriorityMenuVisible(false);
                }}
                title="Orta"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setPriority(TaskPriority.HIGH);
                  setPriorityMenuVisible(false);
                }}
                title="Yüksek"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setPriority(TaskPriority.URGENT);
                  setPriorityMenuVisible(false);
                }}
                title="Acil"
                leadingIcon="flag"
              />
            </Menu>
          </View>

          <Divider style={styles.divider} />

          {/* Grup Seçimi */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Grup *</Text>
            <Menu
              visible={groupMenuVisible}
              onDismiss={() => setGroupMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setGroupMenuVisible(true)}
                  style={styles.menuButton}
                >
                  {selectedGroup?.name || 'Grup seçin'}
                </Button>
              }
            >
              {groups.map((group: any) => (
                <Menu.Item
                  key={group.id}
                  onPress={() => {
                    setSelectedGroupId(group.id);
                    setAssignedToId(''); // Grup değiştiğinde atanan kişiyi sıfırla
                    setGroupMenuVisible(false);
                  }}
                  title={group.name}
                  leadingIcon="account-group"
                />
              ))}
            </Menu>
          </View>

          {/* Atanan Kişi */}
          {selectedGroup && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Atanan Kişi *</Text>
              <Menu
                visible={assigneeMenuVisible}
                onDismiss={() => setAssigneeMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setAssigneeMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {groupMembers.find((member: any) => member.id === assignedToId)?.firstName || 'Kişi seçin'}
                  </Button>
                }
              >
                {groupMembers.map((member: any) => (
                  <Menu.Item
                    key={member.id}
                    onPress={() => {
                      setAssignedToId(member.id);
                      setAssigneeMenuVisible(false);
                    }}
                    title={`${member.firstName} ${member.lastName}`}
                    leadingIcon="account"
                  />
                ))}
              </Menu>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Son Teslim Tarihi */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Son Teslim Tarihi</Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.menuButton}
              icon="calendar"
            >
              {dueDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Button>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dueDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* SLA (Dakika) */}
          <TextInput
            label="SLA (Dakika)"
            value={slaMinutes}
            onChangeText={setSlaMinutes}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            placeholder="Ör: 1440 (1 gün)"
          />

          <Divider style={styles.divider} />

          {/* Etiketler */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Etiketler</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Yeni etiket"
                value={newTag}
                onChangeText={setNewTag}
                style={styles.tagInput}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon="plus"
                    onPress={handleAddTag}
                  />
                }
                onSubmitEditing={handleAddTag}
              />
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Müzik Entegrasyonu */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text style={styles.fieldLabel}>Müzik Entegrasyonu</Text>
              <Text style={styles.switchDescription}>
                Görev başlatıldığında otomatik müzik çalsın
              </Text>
            </View>
            <Switch
              value={musicIntegration}
              onValueChange={setMusicIntegration}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Oluştur Butonu */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleCreateTask}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
          labelStyle={styles.createButtonText}
        >
          Görev Oluştur
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  tagInputContainer: {
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    margin: 16,
  },
  createButton: {
    paddingVertical: 8,
    backgroundColor: '#6200EE',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateTaskScreen;
