"use client";

import { usePathname } from "next/navigation";
import { getCurrentUser } from "app/utils/auth";
import { ChatbotProvider, useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotWidget } from "./ChatbotWidget";
import { cn } from "ui/src/utils/cn";

const UNAUTHENTICATED_PATHS = ["/", "/signup", "/forgot-password"];

function isUnauthenticatedPath(pathname: string): boolean {
  return UNAUTHENTICATED_PATHS.some(
    (p) => p === pathname || pathname.startsWith(`${p}/`)
  );
}

interface ChatbotLayoutIntegrationProps {
  children: React.ReactNode;
}

function ChatbotPanelWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useChatbot();

  return (
    <div
      className={cn(
        "flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen
          ? "w-[400px] max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full"
          : "w-0"
      )}
    >
      <div className="h-full w-[400px] max-md:w-full">
        {children}
      </div>
    </div>
  );
}

export function ChatbotLayoutIntegration({
  children,
}: ChatbotLayoutIntegrationProps) {
  const pathname = usePathname() ?? "";
  const user = getCurrentUser();
  const isAuthenticated = user !== null;
  const showChatbot = isAuthenticated && !isUnauthenticatedPath(pathname);

  return (
    <ChatbotProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Main content wrapper — flex-1 so it takes remaining space and shrinks when panel opens */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
          {children}
        </div>

        {/* Chatbot panel wrapper — transitions width between 0 and 400px */}
        {showChatbot && (
          <ChatbotPanelWrapper>
            <ChatbotWidget />
          </ChatbotPanelWrapper>
        )}
      </div>
    </ChatbotProvider>
  );
}
