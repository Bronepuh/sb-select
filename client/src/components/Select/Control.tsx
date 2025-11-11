import React from 'react';
import styles from './select.module.css';

type Props = {
  open: boolean;
  displayText: string;
  placeholder?: string;
  hasSelected: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCaretClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClearClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const Control: React.FC<Props> = ({
  open,
  displayText,
  placeholder,
  hasSelected,
  onInputChange,
  onInputKeyDown,
  onCaretClick,
  onClearClick,
  inputRef,
}) => {
  return (
    <div className={`${styles.control} ${open ? styles.controlActive : ''}`}>
      <input
        ref={inputRef}
        className={styles.input}
        value={displayText}
        onChange={onInputChange}
        placeholder={placeholder || ''}
        onKeyDown={onInputKeyDown}
        readOnly={!open}
      />

      {hasSelected && (
        <div
          className={styles.clear}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClearClick}
          role="button"
          aria-label="Очистить выбранную опцию"
        >
          ×
        </div>
      )}

      <div
        className={styles.caret}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCaretClick}
        aria-label={open ? 'Закрыть список' : 'Открыть список'}
      />
    </div>
  );
};

export default React.memo(Control);
