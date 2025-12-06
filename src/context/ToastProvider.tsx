import { useState, useCallback, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ToastOptions, ToastState } from "../types/toast";
import { Toast } from "../components/Toast";
import { ToastContext } from "./ToastContext";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ id, ...options }: ToastOptions) => {
    const toastId = id || uuidv4();
    const newToast: ToastState = { id: toastId, ...options };
    setToasts((state) => [newToast, ...state]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed z-[9999] flex flex-col gap-3 w-full max-w-md p-4 pointer-events-none bottom-0 right-0">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};