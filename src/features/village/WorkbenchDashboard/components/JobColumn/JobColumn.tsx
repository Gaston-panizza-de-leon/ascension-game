import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './JobColumn.module.css';

interface JobColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isFull?: boolean;
}

export const JobColumn = ({ id, title, children, isFull = false }: JobColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: isFull,
  });

  const statusClass = isFull ? styles.full : isOver ? styles.over : '';

  return (
    <div ref={setNodeRef} className={`${styles.column} ${statusClass}`}>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};