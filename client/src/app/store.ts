// client/src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import optionsReducer from '../redux/optionsSlice';
import selectionReducer from '../redux/selectionSlice';

export const store = configureStore({
  reducer: {
    options: optionsReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
