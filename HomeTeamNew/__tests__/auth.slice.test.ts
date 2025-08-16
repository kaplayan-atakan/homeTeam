import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, setToken, logout } from '../src/store';

describe('auth slice', () => {
  it('should set and clear token', () => {
    // @ts-ignore use the combined reducer directly
  const store = configureStore({ reducer: rootReducer as any });
    store.dispatch(setToken('abc'));
    // @ts-ignore
    expect(store.getState().auth.token).toBe('abc');
    store.dispatch(logout());
    // @ts-ignore
    expect(store.getState().auth.token).toBeNull();
  });
});
