export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ToastState extends ToastOptions {
  id: string;
}