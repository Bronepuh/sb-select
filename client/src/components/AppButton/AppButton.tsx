import React, { useCallback } from 'react';
import styles from './app-button.module.css';

export type AppButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  title?: string;
};

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  onPress,
  disabled = false,
  title,
}) => {
  const handleActivate = useCallback(() => {
    if (!disabled) onPress();
  }, [disabled, onPress]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleActivate();
      }
    },
    [disabled, handleActivate]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={[styles.button, disabled ? styles.disabled : '']
        .join(' ')
        .trim()}
      onKeyDown={handleKeyDown}
      onClick={handleActivate}
      title={title}
    >
      {children}
    </div>
  );
};

export default AppButton;
