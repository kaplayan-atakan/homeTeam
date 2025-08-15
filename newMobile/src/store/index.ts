import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Slice'ları import edeceğiz
import authSlice from './slices/authSlice';
import taskSlice from './slices/taskSlice';
import groupSlice from './slices/groupSlice';
import notificationSlice from './slices/notificationSlice';
import appSlice from './slices/appSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'], // Sadece bu slice'ları persist et
  blacklist: ['tasks', 'groups', 'notifications'], // Bu slice'ları persist etme
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  tasks: taskSlice,
  groups: groupSlice,
  notifications: notificationSlice,
  app: appSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';
