import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

type SubmitMode = 'ok' | 'error';

const BASE: string = (process.env.API_BASE as string) || '';

export const submitSelected = createAsyncThunk<
  { message: string }, // <- возвращаем объект
  { value: string; mode?: SubmitMode },
  { rejectValue: string }
>('selection/submitSelected', async ({ value, mode }, { rejectWithValue }) => {
  try {
    const body = mode === 'error' ? { value: 'oops' } : { value };

    const res = await fetch(`${BASE}/selected/option`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return rejectWithValue(
        `Ошибка отправки (${res.status}). ${txt || ''}`.trim()
      );
    }

    const data = await res.json().catch(() => ({}));
    const msg = typeof data?.message === 'string' ? data.message : 'Успех';

    return { message: msg };
  } catch {
    return rejectWithValue('Failed to fetch');
  }
});

type SelectionState = {
  value?: string;
  submitting: boolean;
  message: string | null;
  error: string | null;
  messages: string[]; // <- стек сообщений
};

const initial: SelectionState = {
  value: undefined,
  submitting: false,
  message: null,
  error: null,
  messages: [],
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState: initial,
  reducers: {
    setValue(state, action: PayloadAction<string | undefined>) {
      state.value = action.payload;
      state.message = null;
      state.error = null;
      // при выборе значения стек не чистим — это лог событий; но можно включить при желании
    },
    resetSelection(state) {
      state.value = undefined;
      state.submitting = false;
      state.message = null;
      state.error = null;
      state.messages = [];
    },
    clearMessages(state) {
      state.message = null;
      state.error = null;
      state.messages = [];
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
        state.message = action.payload.message;
        state.error = null;
        state.messages.push(action.payload.message);
      })
      .addCase(submitSelected.rejected, (state, action) => {
        state.submitting = false;
        const err = action.payload || action.error.message || 'Ошибка отправки';
        state.message = null;
        state.error = err as string;
        state.messages.push(err as string);
      });
  },
});

export const { setValue, resetSelection, clearMessages } =
  selectionSlice.actions;
export default selectionSlice.reducer;
