import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import providerReducer from './slices/providerSlice';
import uiReducer from './slices/uiSlice';
import auditLogReducer from './slices/auditLogSlice';
import errorLogReducer from './slices/errorLogSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    providers: providerReducer,
    ui: uiReducer,
    auditLogs: auditLogReducer,
    errorLogs: errorLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
