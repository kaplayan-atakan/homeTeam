import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, fetchGroups, fetchTasks } from '../src/store';

jest.mock('../src/services/api', () => ({
  groupsApi: {
    list: jest.fn().mockResolvedValue({ data: { items: [{ id: 'g1', name: 'Family', membersCount: 3 }] } }),
    getById: jest.fn().mockResolvedValue({ data: { id: 'g1', name: 'Family', membersCount: 3 } }),
  },
  tasksApi: {
    list: jest.fn().mockResolvedValue({ data: { items: [{ id: 't1', title: 'Do dishes', status: 'open' }] } }),
    getById: jest.fn().mockResolvedValue({ data: { id: 't1', title: 'Do dishes', status: 'open' } }),
  },
}));

describe('groups/tasks thunks', () => {
  it('fetchGroups should populate store', async () => {
    const store = configureStore({ reducer: rootReducer as any });
    await store.dispatch<any>(fetchGroups());
    // @ts-ignore
    expect(store.getState().groups.items[0].id).toBe('g1');
  });
  it('fetchTasks should populate store', async () => {
    const store = configureStore({ reducer: rootReducer as any });
    await store.dispatch<any>(fetchTasks());
    // @ts-ignore
    expect(store.getState().tasks.items[0].id).toBe('t1');
  });
});
