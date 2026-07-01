import { useState } from "react";
import { IoRefresh } from "react-icons/io5";
import { Modal } from "../../ui/Modal/Modal";
import { saveService } from "../../../utils/saveService";
import styles from "./ResetProgress.module.css";

export default function ResetProgress() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    saveService.deleteSave()
      .then(() => window.location.reload())
      .catch(() => window.location.reload());
  };

  return (
    <>
      <div className={styles.container}>
        <button
          className={styles.trigger}
          onClick={() => setShowConfirm(true)}
        >
          <IoRefresh size={18} className={styles.icon} />
          Reiniciar progreso
        </button>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Reiniciar progreso"
      >
        <div className={styles.confirmBody}>
          <p>
            ¿Seguro que quieres borrar el progreso y reiniciar el juego?
          </p>
          <div className={styles.confirmActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </button>
            <button
              className={styles.confirmBtn}
              onClick={handleReset}
            >
              Sí, reiniciar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
