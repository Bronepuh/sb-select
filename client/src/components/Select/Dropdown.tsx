import React from 'react';
import styles from './select.module.css';
import type { SelectOption } from './types';

type Props = {
  id: string;
  placement: 'up' | 'down';
  listRef: React.RefObject<HTMLDivElement>;
  options: SelectOption[];
  selectedValue?: string;
  activeIndex: number;
  onListMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onListClick: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const Dropdown: React.FC<Props> = ({
  id,
  placement,
  listRef,
  options,
  selectedValue,
  activeIndex,
  onListMouseDown,
  onListClick,
}) => {
  return (
    <div
      ref={listRef}
      id={id}
      role="listbox"
      className={`${styles.dropdown} ${
        placement === 'up' ? styles.dropUp : styles.dropDown
      }`}
      style={{ maxHeight: 250 }}
      onMouseDown={onListMouseDown}
      onClick={onListClick}
    >
      {options.length === 0 ? (
        <div className={styles.empty} role="option" aria-disabled>
          Нет совпадений
        </div>
      ) : (
        options.map((o, idx) => {
          const isSelected = o.value === selectedValue;
          const isActive = idx === activeIndex;
          return (
            <div
              key={o.value}
              data-idx={idx}
              data-value={o.value}
              id={`${id}-opt-${idx}`}
              role="option"
              aria-selected={isSelected}
              className={`${styles.option} ${
                isSelected ? styles.optSelected : ''
              } ${isActive ? styles.optActive : ''}`}
              onMouseDown={(e) => e.preventDefault()}
            >
              {o.name}
            </div>
          );
        })
      )}
    </div>
  );
};

export default React.memo(Dropdown);
