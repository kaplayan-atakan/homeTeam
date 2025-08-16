import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { authReducer, loginThunk, registerThunk, requestResetThunk, setToken, logout } from './slices/auth';
import { groupsReducer, fetchGroups } from './slices/groups';
import { tasksReducer, fetchTasks } from './slices/tasks';

export const rootReducer = combineReducers({
  auth: authReducer,
  groups: groupsReducer,
  tasks: tasksReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Re-exports for convenience
export { loginThunk, registerThunk, requestResetThunk, setToken, logout, fetchGroups, fetchTasks };
