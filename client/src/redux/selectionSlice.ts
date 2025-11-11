import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

type SubmitMode = 'ok' | 'error';

export const submitSelected = createAsyncThunk<
  string, // message
  { value: string; mode?: SubmitMode } // payload
>('selection/submitSelected', async ({ value, mode }) => {
  // error-режим: отправим некорректное значение, чтобы сервер вернул 400
  const body =
    mode === 'error'
      ? { value: 'oops' } // сервер ответит 400 "Некорректное value"
      : { value };

  const res = await fetch('/selected/option', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Ошибка отправки (${res.status}). ${txt || ''}`.trim());
  }

  const data = await res.json().catch(() => ({}));
  const msg = typeof data?.message === 'string' ? data.message : 'Успех';
  return msg;
});

type SelectionState = {
  value?: string;
  submitting: boolean;
  message: string | null;
  error: string | null;
};

const initial: SelectionState = {
  value: undefined,
  submitting: false,
  message: null,
  error: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState: initial,
  reducers: {
    setValue(state, action: PayloadAction<string | undefined>) {
      state.value = action.payload;
      // при смене значения — очищаем предыдущее сообщение/ошибку
      state.message = null;
      state.error = null;
    },
    resetSelection(state) {
      state.value = undefined;
      state.submitting = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(submitSelected.pending, (state) => {
        state.submitting = true;
        state.message = null;
        state.error = null;
      })
      .addCase(submitSelected.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(submitSelected.rejected, (state, action) => {
        state.submitting = false;
        state.message = null;
        state.error = action.error.message || 'Ошибка отправки';
      });
  },
});

export const { setValue, resetSelection } = selectionSlice.actions;
export default selectionSlice.reducer;
