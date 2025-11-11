import type { SelectOption } from './types';

export const prefixFilter = (options: SelectOption[], q: string) => {
  const s = q.trim();
  return s ? options.filter((o) => o.name.startsWith(s)) : options;
};

export const findSelectedName = (options: SelectOption[], value?: string) =>
  options.find((o) => o.value === value)?.name ?? '';

export const computePlacement = (el: HTMLElement | null): 'up' | 'down' => {
  if (!el) return 'down';
  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  return spaceBelow < 250 && rect.top > 250 ? 'up' : 'down';
};
