"use client";

import * as React from "react";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/theme-toggle";
import { ExecutiveSidebar } from "../molecules/executive-sidebar";

// Icons
import {
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
} from "../utils/icons";

interface ExecutiveLayoutProps {
  children: React.ReactNode;
  currentPath?: string | null;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  unreadCount?: number;
  notifications?: any[];
  markAsRead?: (id: string) => void;
  logoutLabel?: string;
  userMenuTitle?: string;
  logoSrc?: string;
  logoSrcDark?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  /** Renders between ThemeToggle and User menu in the header (e.g. ChatbotToggle) */
  headerActions?: React.ReactNode;
}

const ExecutiveLayout = React.forwardRef<HTMLDivElement, ExecutiveLayoutProps>(
  (
    {
      children,
      currentPath,
      userName = "Executive User",
      userEmail = "executive@aegis.com",
      onLogout,
      unreadCount = 0,
      notifications = [],
      markAsRead,
      logoutLabel,
      userMenuTitle,
      logoSrc = "/AegisVision-logo.svg",
      logoSrcDark = "/AegisVision-logo-dark.svg",
      logoAlt = "Aegis Vision",
      logoWidth = 157,
      logoHeight = 32,
      headerActions,
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    return (
      <div
        ref={ref}
        className="flex h-screen w-full overflow-hidden"
        style={{ backgroundColor: "#F8F9FB" }}
      >
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <ExecutiveSidebar
          currentPath={currentPath}
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed((v) => !v)}
          logoSrc={logoSrc}
          logoSrcDark={logoSrcDark}
          logoAlt={logoAlt}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
          onMobileNavClose={() => setMobileMenuOpen(false)}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header - No search bar for Executive */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
                title="Toggle menu"
              >
                <Icon
                  icon={mobileMenuOpen ? ChevronLeft : ChevronRight}
                  className="h-5 w-5"
                />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative"
                >
                  <Icon icon={Bell} className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: "#2563eb" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-3 w-96 animate-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white shadow-2xl">
                      <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[32rem] overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((notification: any, index: number) => (
                            <div
                              key={notification.NotificationId || index}
                              className={cn(
                                "group relative border-b border-gray-100 px-5 py-4 last:border-b-0 transition-colors",
                                "hover:bg-gray-50",
                                notification.Status !== "Read" &&
                                  "border-l-2 border-l-indigo-500 bg-indigo-50/30"
                              )}
                            >
                              <div className="flex gap-3.5">
                                <div
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                    notification.Type === "critical" &&
                                      "bg-red-100 text-red-500",
                                    notification.Type === "warning" &&
                                      "bg-amber-100 text-amber-500",
                                    notification.Type === "info" &&
                                      "bg-blue-100 text-blue-500",
                                    notification.Type === "success" &&
                                      "bg-green-100 text-green-500",
                                    !notification.Type &&
                                      "bg-gray-100 text-gray-500"
                                  )}
                                >
                                  <Icon
                                    icon={
                                      notification.Type === "critical"
                                        ? AlertCircle
                                        : notification.Type === "warning"
                                          ? AlertTriangle
                                          : notification.Type === "success"
                                            ? CheckCircle
                                            : Bell
                                    }
                                    className="h-5 w-5"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                  {notification.Title && (
                                    <p className="text-sm font-semibold text-gray-900">
                                      {notification.Title}
                                    </p>
                                  )}
                                  {notification.Message && (
                                    <p className="line-clamp-2 text-xs text-gray-500">
                                      {notification.Message}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 pt-0.5">
                                    {notification.CreatedAt && (
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          notification.CreatedAt
                                        ).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    )}
                                    {notification.Status !== "Read" &&
                                      markAsRead && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(
                                              notification.NotificationId
                                            );
                                          }}
                                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                          Mark as read
                                        </button>
                                      )}
                                  </div>
                                </div>
                                {notification.Status !== "Read" && (
                                  <div className="flex shrink-0 pt-1">
                                    <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-5 py-12 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                              <Icon
                                icon={Bell}
                                className="h-8 w-8 text-gray-400"
                              />
                            </div>
                            <p className="mb-1 text-sm font-medium text-gray-900">
                              All caught up!
                            </p>
                            <p className="text-xs text-gray-500">
                              No new notifications
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <ThemeToggle />

              {headerActions}

              {/* User Menu / Profile Avatar */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  title={userMenuTitle}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <Icon icon={User} className="h-5 w-5" />
                </Button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                      <div className="border-b border-gray-100 px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        aria-label={logoutLabel}
                      >
                        <Icon icon={LogOut} className="h-4 w-4" />
                        {logoutLabel}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area - Background #F8F9FB */}
          <main
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            style={{ backgroundColor: "#F8F9FB" }}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);

ExecutiveLayout.displayName = "ExecutiveLayout";

export { ExecutiveLayout };
