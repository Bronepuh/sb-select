import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './app.module.css';

import type { RootState, AppDispatch } from './app/store';
import { fetchOptions } from './redux/optionsSlice';
import {
  setValue,
  submitSelected,
  clearMessages,
} from './redux/selectionSlice';

import Select from './components/Select/Select';
import AppButton from './components/AppButton/AppButton';
import Message from './components/Message/Message';
import './global.css';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  const topbarRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(0);

  useLayoutEffect(() => {
    const recalc = () =>
      setTopOffset((topbarRef.current?.offsetHeight || 0) + 16);
    recalc();
    const ro = new ResizeObserver(recalc);
    if (topbarRef.current) ro.observe(topbarRef.current);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, []);

  const { items, status, error } = useSelector((s: RootState) => s.options);
  const {
    value,
    submitting,
    message,
    error: sendError,
    messages,
  } = useSelector((s: RootState) => s.selection);

  useEffect(() => {
    dispatch(fetchOptions({ mode: 'ok' }));
  }, [dispatch]);

  const disabledSubmit =
    !value || submitting || status !== 'succeeded' || items.length === 0;

  // загрузка сценариев
  const loadOK = useCallback(() => {
    dispatch(clearMessages());
    dispatch(fetchOptions({ mode: 'ok' }));
  }, [dispatch]);
  const loadEmpty = useCallback(() => {
    dispatch(clearMessages());
    dispatch(fetchOptions({ mode: 'empty' }));
  }, [dispatch]);
  const loadNull = useCallback(() => {
    dispatch(clearMessages());
    dispatch(fetchOptions({ mode: 'null' }));
  }, [dispatch]);
  const loadError = useCallback(() => {
    dispatch(clearMessages());
    dispatch(fetchOptions({ mode: 'error' }));
  }, [dispatch]);

  // отправка
  const submitOK = useCallback(() => {
    if (value) dispatch(submitSelected({ value, mode: 'ok' }));
  }, [dispatch, value]);
  const submitBad = useCallback(() => {
    if (value) dispatch(submitSelected({ value, mode: 'error' }));
  }, [dispatch, value]);

  const placeholder = useMemo(() => {
    if (status === 'loading') return 'Загрузка…';
    if (status === 'succeeded' && items.length > 0) return 'Выберите опцию';
    if (status === 'succeeded' && items.length === 0) return 'Нет опций';
    if (status === 'failed') return 'Ошибка загрузки';
    return 'Выберите опцию';
  }, [status, items.length]);

  const commonSelectProps = {
    options: items,
    value,
    onChange: (v: string | undefined) => dispatch(setValue(v)),
    placeholder,
  } as const;

  const lastText = error || sendError || message;
  const stack = messages.length ? messages : lastText ? [lastText] : [];

  // Универсальный контейнер кейса с одной кнопкой
  const Case = ({
    title,
    style,
    variant, // 'ok' | 'error'
  }: {
    title: string;
    style?: React.CSSProperties;
    variant: 'ok' | 'error';
  }) => (
    <div className={styles.case} style={style}>
      <div className={styles.caseTitle}>{title}</div>
      <div className={styles.inline}>
        <Select {...commonSelectProps} />
        <div className={styles.actions}>
          {variant === 'ok' ? (
            <AppButton onPress={submitOK} disabled={disabledSubmit}>
              Отправить
            </AppButton>
          ) : (
            <AppButton onPress={submitBad} disabled={disabledSubmit}>
              Ошибка
            </AppButton>
          )}
        </div>
      </div>
      <div className={styles.message}>
        {stack.map((t, i) => (
          <Message key={i} text={t} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Панель сценариев */}
      <div className={styles.topbar} ref={topbarRef}>
        <div className={styles.toolbar}>
          <span className={styles.badge}>Загрузка опций</span>
          <div className={styles.row}>
            <AppButton onPress={loadOK}>OK (1000 опций)</AppButton>
            <AppButton onPress={loadEmpty}>Пусто []</AppButton>
            <AppButton onPress={loadNull}>Некорректные данные (null)</AppButton>
            <AppButton onPress={loadError}>Ошибка сети / endpoint</AppButton>
          </div>
          <div className={styles.statusLine}>
            <span className={styles.status}>
              Статус: {status}
              {status === 'succeeded' ? ` · опций: ${items.length}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Кейс 1: только "Отправить" */}
      <Case
        title="Кейс: верх-лево (выпадение вниз)"
        style={{ top: topOffset, left: 24 }}
        variant="ok"
      />

      {/* Кейс 2: только "Ошибка" */}
      <Case
        title="Кейс: верх-право (выпадение вниз)"
        style={{ top: topOffset, right: 24 }}
        variant="error"
      />

      {/* Кейс 3: только "Отправить" */}
      <Case
        title="Кейс: низ-лево (выпадение вверх)"
        style={{ bottom: 24, left: 24 }}
        variant="ok"
      />

      {/* Кейс 4: только "Отправить" */}
      <Case
        title="Кейс: низ-право (выпадение вверх)"
        style={{ bottom: 24, right: 24 }}
        variant="ok"
      />
    </div>
  );
}
