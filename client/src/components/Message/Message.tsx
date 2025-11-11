import React from 'react';
import styles from './message.module.css';

export type MessageProps = { text?: string | null };

export const Message: React.FC<MessageProps> = ({ text }) => {
  if (!text) return null;
  return <p className={styles.message}>{text}</p>;
};

export default Message;
