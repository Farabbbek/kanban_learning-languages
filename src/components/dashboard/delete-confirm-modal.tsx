"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}: DeleteConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#2A211C]/10 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#F7F3EE] p-8 shadow-[0_24px_64px_rgba(42,33,28,0.16)] border border-[#D88A5B]/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#C56B47]/10 mb-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-[#C56B47]"
          >
            <path
              d="M4 5h12M7 5V4a1 1 0 011-1h4a1 1 0 011 1v1M5 5v10a2 2 0 002 2h6a2 2 0 002-2V5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 9v4M12 9v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-center font-serif text-xl font-medium text-[#2A211C]">
          Delete this task?
        </h3>

        {/* Task name */}
        <p className="mt-2 text-center text-sm text-[#8d8175] leading-relaxed line-clamp-1">
          &ldquo;{taskTitle}&rdquo;
        </p>

        {/* Subtitle */}
        <p className="mt-1 text-center text-xs text-[#b0a49a]">
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 rounded-xl border border-[#D88A5B]/10 bg-white px-4 py-2.5",
              "text-[12px] font-semibold uppercase tracking-wider text-[#2A211C]",
              "transition-all hover:bg-[#D88A5B]/5 active:scale-[0.98]"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5",
              "text-[12px] font-semibold uppercase tracking-wider text-white",
              "bg-[#C56B47] transition-all hover:bg-[#B85D3A] active:scale-[0.98]",
              "shadow-[0_4px_12px_rgba(197,107,71,0.25)]"
            )}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
