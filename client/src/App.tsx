import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './app.module.css';

import { RootState, AppDispatch } from './app/store';
import { fetchOptions } from './redux/optionsSlice';
import { setValue, submitSelected } from './redux/selectionSlice';

import Select from './components/Select/Select';
import AppButton from './components/AppButton/AppButton';
import Message from './components/Message/Message';
import './global.css';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { items, status, error } = useSelector((s: RootState) => s.options);
  const {
    value,
    submitting,
    message,
    error: sendError,
  } = useSelector((s: RootState) => s.selection);

  useEffect(() => {
    dispatch(fetchOptions({ mode: 'ok' }));
  }, [dispatch]);

  const disabledSubmit =
    !value || submitting || status !== 'succeeded' || items.length === 0;

  const loadOK = useCallback(
    () => dispatch(fetchOptions({ mode: 'ok' })),
    [dispatch]
  );
  const loadEmpty = useCallback(
    () => dispatch(fetchOptions({ mode: 'empty' })),
    [dispatch]
  );
  const loadNull = useCallback(
    () => dispatch(fetchOptions({ mode: 'null' })),
    [dispatch]
  );
  const loadError = useCallback(
    () => dispatch(fetchOptions({ mode: 'error' })),
    [dispatch]
  );

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

  return (
    <div className={styles.container}>
      {/* четыре угла */}
      <div className={`${styles.corner} ${styles.tl}`}>
        <Select {...commonSelectProps} />
      </div>
      <div className={`${styles.corner} ${styles.tr}`}>
        <Select {...commonSelectProps} />
      </div>
      <div className={`${styles.corner} ${styles.bl}`}>
        <Select {...commonSelectProps} />
      </div>
      <div className={`${styles.corner} ${styles.br}`}>
        <Select {...commonSelectProps} />
      </div>

      {/* центр */}
      <div className={styles.center}>
        <div className={styles.panel}>
          <h2 className={styles.h1}>Демонстрация сценариев по ТЗ:</h2>
          <p>* Селекты по углам, чтобы было видно, куда они выпадают</p>

          <div className={styles.row}>
            <span className={styles.badge}>Загрузка опций</span>
          </div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <AppButton onPress={loadOK}>Загрузить: OK (1000 опций)</AppButton>
            <AppButton onPress={loadEmpty}>Загрузить: Пусто []</AppButton>
            <AppButton onPress={loadNull}>
              Загрузить: Некорректные данные (null)
            </AppButton>
            <AppButton onPress={loadError}>
              Загрузить: Ошибка сети/endpoint
            </AppButton>
          </div>

          <hr className={styles.hr} />

          <div className={styles.row}>
            <span className={styles.badge}>Отправка выбранной опции</span>
          </div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <AppButton onPress={submitOK} disabled={disabledSubmit}>
              Отправить: OK
            </AppButton>
            <AppButton onPress={submitBad} disabled={disabledSubmit}>
              Отправить: Ошибка 400
            </AppButton>
          </div>

          <div className={styles.message}>
            <Message text={error || sendError || message} />
          </div>
        </div>
      </div>
    </div>
  );
}
