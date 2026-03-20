import React from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ text, children }) => {
  return (
    <div className={styles.container}>
      {children}
      <span className={styles.tooltipText}>{text}</span>
    </div>
  );
};

export default Tooltip;