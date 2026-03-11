"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pin, MoreHorizontal } from "lucide-react";
import { ChatItemMenu } from "./ChatItemMenu";
import type { ChatConversation } from "@/services/ai-chat/chatHistory";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDeleteConfirm = useCallback(() => {
    onDelete(chat.id);
    setShowDeleteConfirm(false);
    setMenuOpen(false);
  }, [chat.id, onDelete]);

  if (showDeleteConfirm) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <p className="text-sm text-gray-700">Delete this chat?</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            className="rounded-lg px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onSelect(chat.id)}
        className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
          isActive
            ? "bg-gray-200 text-gray-800"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {isPinned && (
          <Pin className="h-3 w-3 flex-shrink-0 text-indigo-500" />
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 rounded border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
          />
        ) : (
          <span className="flex-1 truncate">{chat.title}</span>
        )}

        {!isEditing && (
          <div
            className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              aria-label="Chat options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </button>

      {menuOpen && (
        <ChatItemMenu
          onRename={() => {
            setIsEditing(true);
            setMenuOpen(false);
          }}
          onDelete={() => setShowDeleteConfirm(true)}
          onPin={() => onPin(chat.id)}
          onUnpin={() => onUnpin(chat.id)}
          isPinned={isPinned}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
