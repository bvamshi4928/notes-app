import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
    warning: "alert-warning",
  };

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${typeStyles[type]} shadow-lg`}>
        <div className="flex items-center gap-2">
          <span>{message}</span>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
