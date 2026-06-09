/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";

// Elegant Card Component
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = "", id }) => (
  <div
    id={id}
    className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

// Button UI
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "success" | "warning";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  id?: string;
}> = ({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
  type = "button",
  id,
}) => {
  const base = "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-brand-teal text-white hover:bg-brand-teal/90 active:scale-98 shadow-sm",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-98",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-98",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98",
    warning: "bg-amber-500 text-white hover:bg-amber-600 active:scale-98",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input UI
export const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  id?: string;
}> = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  className = "",
  required = false,
  min,
  max,
  id,
}) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      className="px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors disabled:bg-slate-50 disabled:text-slate-400"
    />
  </div>
);

// Select UI
export const Select: React.FC<{
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
}> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  required = false,
  id,
}) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Badge UI
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "info" | "neutral" | "brand";
  className?: string;
  id?: string;
}> = ({ children, variant = "neutral", className = "", id }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-slate-50 text-slate-700 border-slate-100",
    brand: "bg-cyan-50 text-brand-teal border-cyan-100",
  };

  return (
    <span
      id={id}
      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Modal Component
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ isOpen, onClose, title, children, footer, className = "", id }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div
        id={id}
        className={`bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 font-display uppercase tracking-wider">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notification container (Placed in root App layout)
export const ToastContainer: React.FC<{
  toasts?: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  onClose?: (id: string) => void;
}> = ({ toasts: propToasts, onClose: propOnClose }) => {
  const store = useHotelStore();
  const toasts = propToasts ?? store.toasts ?? [];
  const onClose = propOnClose ?? store.removeToast;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-4 h-4 text-emerald-600" />,
          error: <AlertCircle className="w-4 h-4 text-red-600" />,
          info: <Info className="w-4 h-4 text-blue-600" />,
        };

        const bg = {
          success: "bg-emerald-50 border-emerald-100 text-slate-800",
          error: "bg-red-50 border-red-100 text-slate-800",
          info: "bg-blue-50 border-blue-100 text-slate-800",
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 p-3.5 rounded-lg border shadow-lg ${bg[toast.type]} animate-in slide-in-from-bottom-5 duration-200`}
          >
            <span className="mt-0.5">{icons[toast.type]}</span>
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => onClose(toast.id)}
              className="p-0.5 hover:bg-black/5 rounded cursor-pointer self-start"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Loading Skeleton UI
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="w-full flex flex-col gap-3 py-2 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-6 bg-slate-100 rounded-md w-full" />
    ))}
  </div>
);

// Confirm dialog standard modal
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "success";
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    footer={
      <>
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </>
    }
  >
    <div className="flex gap-3">
      <AlertTriangle className={`w-10 h-10 shrink-0 ${variant === "danger" ? "text-red-500" : "text-brand-teal"}`} />
      <div className="text-sm text-slate-600 leading-relaxed">{message}</div>
    </div>
  </Modal>
);
