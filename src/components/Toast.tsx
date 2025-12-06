import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import type { ToastState } from "../types/toast";

interface ToastProps {
  toast: ToastState;
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  error: <AlertCircle className="w-6 h-6 text-red-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const containerStyles = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  warning: "border-l-yellow-500",
  info: "border-l-blue-500",
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const {
    id,
    type = "info",
    title,
    message,
    duration = 5000,
    onConfirm,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
  } = toast;

  const [isClosing, setIsClosing] = useState(false);
  const isActionable = !!onConfirm;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  useEffect(() => {
    if (!isActionable) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isActionable, handleClose]);

  return (
    <div
      className={`
        relative w-full p-4 rounded-lg shadow-lg border-l-4 border-y border-r border-gray-200
        bg-white text-gray-900
        flex flex-col gap-2 pointer-events-auto
        transform transition-all duration-300 ease-out
        ${containerStyles[type]}
        ${isClosing ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
        <div className="flex-1 pr-6">
          {title && <h3 className="font-bold text-sm mb-1">{title}</h3>}
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        {!isActionable && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isActionable && (
        <div className="flex justify-end gap-3 mt-2 pl-9">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-3 py-1.5 text-sm rounded-md font-bold text-white shadow-sm transition-opacity hover:opacity-90
              ${type === "error" ? "bg-red-600" : "bg-blue-600"}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      )}
    </div>
  );
};