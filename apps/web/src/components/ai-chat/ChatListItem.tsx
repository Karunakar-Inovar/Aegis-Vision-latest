"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ChatConversation } from "@/services/ai-chat/chatHistory";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler]);
}

interface ChatListItemProps {
  chat: ChatConversation;
  isActive: boolean;
  isPinned: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
}

export function ChatListItem({
  chat,
  isActive,
  isPinned,
  onSelect,
  onRename,
  onDelete,
  onPin,
  onUnpin,
}: ChatListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chat.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(chat.title);
  }, [chat.title]);

  const handleSaveRename = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed !== chat.title) {
      onRename(chat.id, trimmed || "New Chat");
    }
    setIsEditing(false);
  }, [editValue, chat.id, chat.title, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveRename();
      } else if (e.key === "Escape") {
        setEditValue(chat.title);
        setIsEditing(false);
      }
    },
    [handleSaveRename, chat.title]
  );

  const handleRename = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handlePin = () => {
    isPinned ? onUnpin(chat.id) : onPin(chat.id);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(chat.id);
    setMenuOpen(false);
  };

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div ref={menuRef} className="relative group">
      <button
        type="button"
        onClick={() => onSelect(chat.id)}
        className={`
          w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate
          ${isActive
            ? "bg-gray-200/80 text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-100/80"
          }
        `}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full min-w-0 rounded border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
          />
        ) : (
          chat.title
        )}
      </button>

      {/* Three-dot menu — only on hover, positioned absolutely to the right */}
      {!isEditing && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md"
            aria-label="Chat options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-0.5 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <button
            type="button"
            onClick={() => handleRename()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            <Pencil className="w-3 h-3" /> Rename
          </button>
          <button
            type="button"
            onClick={() => handlePin()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            <Pin className="w-3 h-3" /> {isPinned ? "Unpin" : "Pin"}
          </button>
          <div className="my-0.5 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => handleDelete()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
