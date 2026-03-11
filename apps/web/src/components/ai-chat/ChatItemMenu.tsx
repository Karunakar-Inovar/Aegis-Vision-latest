"use client";

import { useRef, useEffect } from "react";
import { Pin, Pencil, Trash2 } from "lucide-react";

export interface ChatItemMenuProps {
  onRename: () => void;
  onDelete: () => void;
  onPin: () => void;
  onUnpin: () => void;
  isPinned: boolean;
  onClose: () => void;
}

export function ChatItemMenu({
  onRename,
  onDelete,
  onPin,
  onUnpin,
  isPinned,
  onClose,
}: ChatItemMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
    >
      <button
        type="button"
        onClick={() => {
          onRename();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Rename
      </button>
      <button
        type="button"
        onClick={() => {
          isPinned ? onUnpin() : onPin();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
      >
        <Pin className="h-3.5 w-3.5" />
        {isPinned ? "Unpin" : "Pin"}
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        type="button"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
