"use client";

interface ChatTopBarProps {
  conversationTitle: string;
}

export function ChatTopBar({ conversationTitle }: ChatTopBarProps) {
  const hasTitle =
    conversationTitle && conversationTitle !== "New Chat";

  return (
    <div
      className={`w-full ${hasTitle ? "border-b border-gray-100" : ""}`}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: minimal spacer */}
        <div className="min-w-[40px]" />

        {/* Center: conversation title */}
        <p className="max-w-[400px] truncate text-center text-sm font-medium text-gray-500">
          {hasTitle ? conversationTitle : ""}
        </p>

        {/* Right: spacer for balance */}
        <div className="min-w-[40px]" />
      </div>
    </div>
  );
}
