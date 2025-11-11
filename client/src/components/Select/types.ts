export type SelectOption = { name: string; value: string };

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
};
