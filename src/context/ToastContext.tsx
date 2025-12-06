import { createContext } from "react";
import type { ToastOptions } from "../types/toast";

export interface ToastContextData {
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextData | null>(null);