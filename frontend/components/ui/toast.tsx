"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const showToast = (msg: string, t: ToastType) => {
    setMessage(msg);
    setType(t);
    setOpen(false); // reset
    requestAnimationFrame(() => setOpen(true));
  };

  return (
    <ToastContext.Provider
      value={{
        success: (msg) => showToast(msg, "success"),
        error: (msg) => showToast(msg, "error"),
        info: (msg) => showToast(msg, "info"),
        warning: (msg) => showToast(msg, "warning"),
      }}
    >
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={`
            rounded-lg px-4 py-3 shadow-lg border
            ${type === "success" && "bg-green-50 border-green-300"}
            ${type === "error" && "bg-red-50 border-red-300"}
            ${type === "info" && "bg-blue-50 border-blue-300"}
            ${type === "warning" && "bg-yellow-50 border-yellow-300"}
          `}
        >
          <Toast.Title className="font-semibold">
            {type === "success" && "Thành công"}
            {type === "error" && "Lỗi"}
            {type === "info" && "Thông báo"}
            {type === "warning" && "Cảnh báo"}
          </Toast.Title>
          <Toast.Description className="text-sm text-gray-700">
            {message}
          </Toast.Description>
        </Toast.Root>

      <Toast.Viewport
        className="
            fixed top-4 left-1/2 -translate-x-1/2
            w-96 max-w-[90vw]
            z-[99999]
        "
        />

      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
