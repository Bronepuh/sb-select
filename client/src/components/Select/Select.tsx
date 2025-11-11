import React, { memo, useRef } from 'react';
import { Control } from './Control';
import { Dropdown } from './Dropdown';
import { useSelectController } from './hooks';
import type { SelectProps } from './types';
import styles from './select.module.css';

const SelectCmp: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    open,
    hasSelected,
    placement,
    filtered,
    activeIndex,
    listId,
    activeId,
    displayText,
    onRootKeyDown,
    onRootClick,
    onCaretClick,
    onClearClick,
    onListClick,
    onListMouseDown,
    onInputChange,
    onInputKeyDown,
  } = useSelectController({
    options,
    value,
    onChange,
    rootRef,
    inputRef,
    listRef,
  });

  return (
    <div
      ref={rootRef}
      className={`${styles.wrapper} ${open ? styles.open : ''}`}
      style={{ width: 250 }}
      tabIndex={0}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={activeId}
      onKeyDown={onRootKeyDown}
      onClick={onRootClick}
      data-has-selected={hasSelected ? 'true' : 'false'}
    >
      <Control
        open={open}
        displayText={displayText}
        placeholder={placeholder}
        hasSelected={hasSelected}
        onInputChange={onInputChange}
        onInputKeyDown={onInputKeyDown}
        onCaretClick={onCaretClick}
        onClearClick={onClearClick}
        inputRef={inputRef}
      />

      {open && (
        <Dropdown
          id={listId}
          placement={placement}
          listRef={listRef}
          options={filtered}
          selectedValue={value}
          activeIndex={activeIndex}
          onListMouseDown={onListMouseDown}
          onListClick={onListClick}
        />
      )}
    </div>
  );
};

export const Select = memo(SelectCmp);
export default Select;
