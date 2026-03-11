"use client";

import { ExecutiveLayout, Snackbar, useSnackbar } from "ui";
import { ChatbotToggle } from "@/components/chatbot/ChatbotToggle";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  logout,
  reconnectSocket,
  normalizeUserRole,
} from "app/utils/auth";
import { useNotifications } from "../context/use-socket";
import { ROUTES, UI_MESSAGES, USER_ROLES } from "app/constants";

export default function ExecutiveLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const snackbar = useSnackbar();

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const logoSrc = "/AegisVision-logo.svg";
  const logoSrcDark = "/AegisVision-logo-dark.svg";
  const logoAlt = "Aegis Vision";
  const logoWidth = 157;
  const logoHeight = 32;

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    const userRole = normalizeUserRole(currentUser.role);
    const executiveRole = normalizeUserRole(USER_ROLES.EXECUTIVE);
    const adminRole = normalizeUserRole(USER_ROLES.ADMINISTRATOR);
    // Allow both Executive and Administrator (Admin can access Executive view for oversight/demo)
    if (userRole !== executiveRole && userRole !== adminRole) {
      router.push("/");
      return;
    }
    reconnectSocket();
    setUser(currentUser);
    setLoading(false);
  }, [router, pathname]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      snackbar.success(result.message || UI_MESSAGES.auth.logoutSuccess);
    } else {
      snackbar.error(result.message || UI_MESSAGES.auth.logoutFailed);
    }
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ExecutiveLayout
      currentPath={pathname}
      userName={user.name}
      userEmail={user.email}
      onLogout={handleLogout}
      unreadCount={unreadCount}
      notifications={notifications}
      markAsRead={markAsRead}
      logoutLabel={UI_MESSAGES.auth.logoutAction}
      userMenuTitle={UI_MESSAGES.auth.userMenuTitle}
      logoSrc={logoSrc}
      logoSrcDark={logoSrcDark}
      logoAlt={logoAlt}
      logoWidth={logoWidth}
      logoHeight={logoHeight}
      headerActions={<ChatbotToggle />}
    >
      {children}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </ExecutiveLayout>
  );
}
