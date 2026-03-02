"use client";

import { AdminLayout, ThemeToggle, Snackbar, useSnackbar } from "ui";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, reconnectSocket, normalizeUserRole } from "app/utils/auth";
import { useNotifications, useSocket } from "../context/use-socket";
import { ROUTES, UI_MESSAGES } from "app/constants";
import { USER_ROLES } from "app/constants";


export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const snackbar = useSnackbar();

  const
    { notifications,
      unreadCount,
      markAsRead,
    } = useNotifications();

  const logoSrc = "/AegisVision-logo.svg";
  const logoSrcDark = "/AegisVision-logo-dark.svg";
  const logoAlt = "Aegis Vision";
  const logoWidth = 157;
  const logoHeight = 32;

  // Check if we're on the setup wizard or reset password page
  const isSetupPage =
    pathname?.startsWith(ROUTES.ADMIN.SETUP) || pathname === ROUTES.ADMIN.RESET_PASSWORD;

  useEffect(() => {
    const expectedRole = normalizeUserRole(USER_ROLES.ADMINISTRATOR);
    const currentUser = getCurrentUser();
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

  // If on setup / reset pages, render minimal full-width header and a single centered column
  if (isSetupPage) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        {/* Minimal Header (full width) */}
        <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={logoWidth}
                height={logoHeight}
                className="h-8 w-auto object-contain dark:hidden"
                priority
              />
              <Image
                src={logoSrcDark}
                alt={logoAlt}
                width={logoWidth}
                height={logoHeight}
                className="hidden h-8 w-auto object-contain dark:block"
                priority
              />
              <span className="sr-only">{logoAlt}</span>
            </div>
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

  return (
    <AdminLayout
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
    >
      {children}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </AdminLayout>
  );
}

