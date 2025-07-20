// src/components/ui/Modal/Modal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import { IoClose } from 'react-icons/io5'; // Usamos react-icons que ya está en el proyecto

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {title && <h2 className={styles.modalTitle}>{title}</h2>}
          <button onClick={onClose} className={styles.closeButton}>
            <IoClose size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>,
    document.body // ¡La magia del portal!
  );
};