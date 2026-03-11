"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Search, MessageSquare, PanelLeftClose, PanelLeftOpen, SquarePen } from "lucide-react";
import { ChatListItem } from "./ChatListItem";
import {
  groupByTime,
  type ChatConversation,
} from "@/services/ai-chat/chatHistory";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onPinChat: (id: string) => void;
  onUnpinChat: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onPinChat,
  onUnpinChat,
  searchQuery,
  onSearchChange,
}: ChatSidebarProps) {
  const handleSearchClick = useCallback(() => {
    onToggleSidebar();
  }, [onToggleSidebar]);

  const pinnedChats = conversations.filter((c) => c.isPinned);
  const unpinnedChats = conversations.filter((c) => !c.isPinned);
  const timeGroups = groupByTime(unpinnedChats);
  const allChats = [...pinnedChats, ...unpinnedChats];

  if (!isSidebarOpen) {
    return (
      <div className="flex h-full flex-col items-center bg-gray-50 border-r border-gray-200 pt-3 gap-1">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
          title="New Chat"
          aria-label="New chat"
        >
          <SquarePen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSearchClick}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
          title="Search chats"
          aria-label="Search chats"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 border-r border-gray-200">
      {/* Header row — logo left, action buttons right */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="relative h-6 w-auto">
          <Image
            src="/AegisVision-logo.svg"
            alt="AegisVision"
            width={24}
            height={24}
            className="h-6 w-auto object-contain dark:hidden"
          />
          <Image
            src="/AegisVision-logo-dark.svg"
            alt="AegisVision"
            width={24}
            height={24}
            className="absolute inset-0 hidden h-6 w-auto object-contain dark:block"
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNewChat}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
            title="New Chat"
            aria-label="New chat"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat list — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
        {/* Pinned section */}
        {pinnedChats.length > 0 && (
          <>
            <p className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Pinned
            </p>
            {pinnedChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeConversationId === chat.id}
                isPinned
                onSelect={onSelectChat}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
                onPin={onPinChat}
                onUnpin={onUnpinChat}
              />
            ))}
            <div className="my-2 border-b border-gray-200" />
          </>
        )}

        {/* Recents grouped by time */}
        {timeGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
              {group.label}
            </p>
            {group.chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeConversationId === chat.id}
                isPinned={false}
                onSelect={onSelectChat}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
                onPin={onPinChat}
                onUnpin={onUnpinChat}
              />
            ))}
          </div>
        ))}

        {/* Empty state */}
        {allChats.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            No conversations yet
          </div>
        )}
      </div>

      {/* Bottom section — user info */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">User</p>
            <p className="text-xs text-gray-400">Vision AI User</p>
          </div>
        </div>
      </div>
    </div>
  );
}
