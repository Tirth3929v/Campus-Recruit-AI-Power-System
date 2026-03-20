import React from 'react';
import styles from './Toast.module.css';

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;