import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SelectOption } from '../components/Select/types';

type Mode = 'ok' | 'empty' | 'null' | 'error';

export const fetchOptions = createAsyncThunk<
  SelectOption[],
  { mode?: Mode } | undefined
>('options/fetchOptions', async (arg) => {
  const mode = arg?.mode ?? 'ok';

  // error-режим: имитируем сетевую ошибку/битый endpoint
  const url =
    mode === 'error'
      ? 'http://127.0.0.1:5999/options/for/select'
      : `/options/for/select${mode !== 'ok' ? `?mode=${mode}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();

  if (!Array.isArray(data)) {
    // null или что-то не то
    throw new Error('Некорректный формат данных от сервера');
  }

  // лёгкая валидация
  const items: SelectOption[] = data.filter(
    (x: any) => x && typeof x.name === 'string' && typeof x.value === 'string'
  );

  return items;
});

type OptionsState = {
  items: SelectOption[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: OptionsState = {
  items: [],
  status: 'idle',
  error: null,
};

const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    resetOptions(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOptions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchOptions.fulfilled,
        (state, action: PayloadAction<SelectOption[]>) => {
          state.status = 'succeeded';
          state.items = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchOptions.rejected, (state, action) => {
        state.status = 'failed';
        state.items = [];
        state.error = action.error.message || 'Ошибка загрузки';
      });
  },
});

export const { resetOptions } = optionsSlice.actions;
export default optionsSlice.reducer;
