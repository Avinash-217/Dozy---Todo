import React from 'react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" id="toastContainer" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="toast" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: toast.type === 'error' ? 'var(--error)' : 'var(--secondary)' }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
