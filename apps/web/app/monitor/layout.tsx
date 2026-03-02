"use client";

import { MonitorLayout, Snackbar, useSnackbar, ThemeToggle } from "ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, reconnectSocket, normalizeUserRole } from "app/utils/auth";
import { useNotifications } from "../context/use-socket";
import { ROUTES, UI_MESSAGES, USER_ROLES, APP_BRAND } from "app/constants";
import Image from "next/image";

export default function MonitorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const snackbar = useSnackbar();
  const currentUser = getCurrentUser();

    const
      { notifications,
        unreadCount,
        markAsRead,
      } = useNotifications();
        
  // Check if we're on the reset password page
  const isResetPasswordPage = pathname === ROUTES.MONITOR.RESET_PASSWORD;

  useEffect(() => {
    const expectedRole = normalizeUserRole(USER_ROLES.MONITOR);
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (normalizeUserRole(currentUser.role) !== expectedRole) {
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
    router.push("/");
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

  const logoSrc = "/AegisVision-logo.svg";
  const logoSrcDark = "/AegisVision-logo-dark.svg";

  // If on reset password page, render minimal full-width header and a single centered column
  if (isResetPasswordPage) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        {/* Minimal Header (full width) */}
        <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Image
              src={logoSrc}
              alt={APP_BRAND.LOGO_ALT}
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
            />
            <span className="sr-only">{APP_BRAND.NAME}</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Centered content column */}
        <main className="min-h-[calc(100vh-4rem)] w-full px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>
    );
  }

  // Route table (Monitor IA):
  // /monitor/live (primary) ← legacy /monitor/dashboard redirects here
  // /monitor/alerts ← legacy alert routes redirect here
  // /monitor/incidents
  // /monitor/shift ← legacy /monitor/summary redirects here
  return (
    <MonitorLayout
      currentPath={pathname}
      userName={currentUser?.name}
      userEmail={currentUser?.email}
      alertCount={unreadCount}
      notifications={notifications}
      unreadCount={unreadCount}
      markAsRead={markAsRead}
      onLogout={handleLogout}
      logoutLabel={UI_MESSAGES.auth.logoutAction}
      userMenuTitle={UI_MESSAGES.auth.userMenuTitle}
      logoSrc={logoSrc}
      logoSrcDark={logoSrcDark}
      logoAlt={APP_BRAND.LOGO_ALT}
    >
      {children}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </MonitorLayout>
  );
}

