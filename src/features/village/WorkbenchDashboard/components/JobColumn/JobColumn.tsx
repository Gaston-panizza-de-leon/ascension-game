import { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import styles from "./JobColumn.module.css";

interface JobColumnProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: React.ReactNode;
  isFull?: boolean;
}

export const JobColumn = ({
  id,
  title,
  icon,
  children,
  isFull = false,
}: JobColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: isFull,
  });

  const statusClass = isFull ? styles.full : isOver ? styles.over : "";

  return (
    <div ref={setNodeRef} className={`${styles.column} ${statusClass}`}>
      <h3 className={styles.title}>
        {icon}
        <span>{title}</span>
      </h3>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
