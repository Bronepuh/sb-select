import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computePlacement, findSelectedName, prefixFilter } from './helpers';
import type { SelectOption } from './types';

export type SelectControllerArgs = {
  options: SelectOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  rootRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLDivElement>;
};

export function useSelectController({
  options,
  value,
  onChange,
  rootRef,
  inputRef,
  listRef,
}: SelectControllerArgs) {
  const listIdRef = useRef(`listbox-${Math.random().toString(36).slice(2)}`);
  const suppressOpenRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<'up' | 'down'>('down');

  const selectedName = useMemo(
    () => findSelectedName(options, value),
    [options, value]
  );
  const hasSelected = !!selectedName;
  const filtered = useMemo(
    () => prefixFilter(options, query),
    [options, query]
  );

  const focusInput = useCallback(() => {
    const i = inputRef.current;
    if (!i) return;
    i.focus();
    i.select();
  }, [inputRef]);

  const openDropdown = useCallback(() => {
    if (open) return;
    setPlacement(computePlacement(rootRef.current));
    setOpen(true);
    const idx = Math.max(
      0,
      filtered.findIndex((o) => o.value === value)
    );
    setActiveIndex(filtered.length ? idx : -1);
    requestAnimationFrame(focusInput);
  }, [open, rootRef, filtered, value, focusInput]);

  const closeDropdown = useCallback(() => {
    if (!open) return;
    setOpen(false);
    setActiveIndex(-1);
    suppressOpenRef.current = false;
  }, [open]);

  // Закрытие по клику вне
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const r = rootRef.current;
      if (!r) return;
      if (!r.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', onDoc, true);
    return () => document.removeEventListener('mousedown', onDoc, true);
  }, [open, closeDropdown, rootRef]);

  // Автоскролл к активному элементу (для клавиатуры)
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    if (!item) return;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + list.clientHeight;
    if (top < viewTop) list.scrollTop = top;
    else if (bottom > viewBottom) list.scrollTop = bottom - list.clientHeight;
  }, [activeIndex, open, listRef]);

  // Хендлеры

  const onRootKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (open) {
          if (activeIndex >= 0 && filtered[activeIndex])
            onChange(filtered[activeIndex].value);
          closeDropdown();
        } else {
          openDropdown();
        }
        return;
      }
      if (e.key === 'Tab') {
        closeDropdown();
        return;
      }
      if (!open && e.key.length === 1) {
        openDropdown();
        setTimeout(() => {
          const i = inputRef.current;
          if (!i) return;
          i.value = e.key;
          setQuery(e.key);
          setActiveIndex(0);
        }, 0);
      }
    },
    [
      open,
      activeIndex,
      filtered,
      onChange,
      closeDropdown,
      openDropdown,
      inputRef,
    ]
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!filtered.length) return;
        setActiveIndex((i) => {
          const next = Math.min(filtered.length - 1, Math.max(0, i + 1));
          return next === i ? i : next;
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!filtered.length) return;
        setActiveIndex((i) => {
          const next = Math.max(0, i - 1);
          return next === i ? i : next;
        });
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex])
          onChange(filtered[activeIndex].value);
        closeDropdown();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
        return;
      }
      if (e.key === 'Tab') {
        closeDropdown();
        return;
      }
    },
    [filtered, activeIndex, onChange, closeDropdown]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (next !== query) {
        setQuery(next);
        setActiveIndex(0);
      }
    },
    [query]
  );

  const onRootClick = useCallback(() => {
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false;
      return;
    }
    if (!open) openDropdown();
  }, [open, openDropdown]);

  const onCaretClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (open) closeDropdown();
      else openDropdown();
    },
    [open, closeDropdown, openDropdown]
  );

  const onClearClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      suppressOpenRef.current = false;
      onChange(undefined);
      setQuery('');
      inputRef.current?.focus();
    },
    [onChange, inputRef]
  );

  const onListClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      suppressOpenRef.current = true;
      const target = e.target as HTMLElement;
      const opt = target.closest<HTMLElement>('[data-idx]');
      if (!opt) return;
      const val = opt.getAttribute('data-value') || undefined;
      if (val !== undefined) onChange(val);
      closeDropdown();
    },
    [onChange, closeDropdown]
  );

  const onListMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    suppressOpenRef.current = true;
  }, []);

  const displayText = open ? query : selectedName || '';
  const listId = listIdRef.current;
  const activeId =
    activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  return {
    // state / derived
    open,
    hasSelected,
    placement,
    filtered,
    activeIndex,
    listId,
    activeId,
    displayText,

    // handlers
    onRootKeyDown,
    onRootClick,
    onCaretClick,
    onClearClick,
    onListClick,
    onListMouseDown,
    onInputChange,
    onInputKeyDown,
  };
}
