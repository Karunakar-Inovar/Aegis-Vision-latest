"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/theme-toggle";
import { SidebarNav, type NavItem } from "../molecules/sidebar-nav";
import {
  Eye,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "../utils/icons";
import { ROUTES } from "app/constants";

interface MonitorLayoutProps {
  children: React.ReactNode;
  currentPath?: string | null;
  userName?: string;
  userEmail?: string;
  alertCount?: number;
  unreadCount?: number;
  notifications?: any[];
  markAsRead?: (id: string) => void;
  onLogout?: () => void;
  logoutLabel?: string;
  userMenuTitle?: string;
  logoSrc?: string;
  logoSrcDark?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
}

const MonitorLayout = React.forwardRef<HTMLDivElement, MonitorLayoutProps>(
  (
    {
      children,
      currentPath,
      userName = "Monitor User",
      userEmail = "monitor@aegis.com",
      alertCount = 0,
      unreadCount = 0,
      notifications = [],
      markAsRead,
      onLogout,
      logoutLabel,
      userMenuTitle,
      logoSrc,
      logoSrcDark,
      logoAlt,
      logoWidth = 64,
      logoHeight = 64,
    },
    ref
  ) => {
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [collapsed, setCollapsed] = React.useState(false);

    // Route table (Monitor IA)
    // - /monitor/live (primary) ← old /monitor/dashboard redirects here
    // - /monitor/alerts ← legacy alert routes redirect here
    // - /monitor/incidents
    // - /monitor/shift ← old /monitor/summary redirects here
    const navItems: NavItem[] = [
      {
        title: "Live Monitoring",
        href: "/monitor/live",
        icon: LayoutDashboard,
      },
      {
        title: "Alerts",
        href: "/monitor/alerts",
        icon: Bell,
      },
      {
        title: "Incidents",
        href: "/monitor/incidents",
        icon: AlertTriangle,
      },
      {
        title: "Shift Overview",
        href: "/monitor/shift",
        icon: FileText,
      },
    ];

    return (
      <div
        ref={ref}
        className="flex h-screen w-full overflow-hidden bg-background"
      >
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
            collapsed ? "w-16" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className={cn(
            "flex h-16 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}>
            <Link
              href={ROUTES.MONITOR.DASHBOARD ?? "/monitor/dashboard"}
              className="flex items-center gap-2"
              aria-label={logoAlt}
            >
              {logoSrc ? (
                <>
                  <Image
                    src={logoSrc}
                    alt={logoAlt ?? ""}
                    width={logoWidth}
                    height={logoHeight}
                    className={cn(
                      "h-10 w-auto object-contain",
                      logoSrcDark && "dark:hidden"
                    )}
                    priority
                  />
                  {logoSrcDark && (
                    <Image
                      src={logoSrcDark}
                      alt={logoAlt ?? ""}
                      width={logoWidth}
                      height={logoHeight}
                      className="hidden h-10 w-auto object-contain dark:block"
                      priority
                    />
                  )}
                </>
              ) : (
                <Icon icon={Eye} className="h-8 w-8 text-sidebar-primary" />
              )}
              <span className="sr-only">{logoAlt}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
            >
              <Icon icon={collapsed ? ChevronRight : ChevronLeft} className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {!collapsed ? (
              <div onClickCapture={() => setMobileMenuOpen(false)}>
                <SidebarNav items={navItems} currentPath={currentPath} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-center rounded-md p-2 transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      currentPath === item.href &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    title={item.title}
                  >
                    <Icon icon={item.icon} className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
          <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
            <div className="flex items-center gap-3">
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
                  {alertCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                      {alertCount > 9 ? "9+" : alertCount}
                    </span>
                  )}
                </Button>

                {notificationsOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-[9999] animate-in fade-in-0"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full z-[9999] mt-3 w-96 rounded-xl border border-border/50 bg-popover shadow-2xl animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-background/50 to-background/30">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-[32rem] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-border/80">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((notification: any, index: number) => (
                            <div
                              key={notification.NotificationId || index}
                              className={cn(
                                "group relative px-5 py-4 border-b border-border/30 last:border-b-0 transition-all duration-200",
                                "hover:bg-accent/30 hover:border-l-4 hover:border-l-blue-500 cursor-pointer",
                                notification.Status !== "Read" && "bg-blue-500/5 border-l-2 border-l-blue-500/50"
                              )}
                            >
                              <div className="flex gap-3.5">
                                {/* Icon with background */}
                                <div className={cn(
                                  "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg",
                                  notification.Type === "critical" && "bg-red-500/10 text-red-500",
                                  notification.Type === "warning" && "bg-amber-500/10 text-amber-500",
                                  notification.Type === "info" && "bg-blue-500/10 text-blue-500",
                                  notification.Type === "success" && "bg-green-500/10 text-green-500",
                                  !notification.Type && "bg-muted text-muted-foreground"
                                )}>
                                  <Icon
                                    icon={
                                      notification.Type === "critical" ? AlertCircle :
                                      notification.Type === "warning" ? AlertTriangle :
                                      notification.Type === "success" ? CheckCircle :
                                      Bell
                                    }
                                    className="h-5 w-5"
                                  />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  {notification.Title && (
                                    <p className="text-sm font-semibold text-foreground leading-tight">
                                      {notification.Title}
                                    </p>
                                  )}
                                  {notification.Message && (
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                      {notification.Message}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 pt-0.5">
                                    {notification.CreatedAt && (
                                      <p className="text-xs text-muted-foreground/80">
                                        {new Date(notification.CreatedAt).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    )}
                                    {notification.Status !== "Read" && markAsRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.NotificationId);
                                        }}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Unread indicator */}
                                {notification.Status !== "Read" && (
                                  <div className="flex-shrink-0 flex items-start pt-1">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20 animate-pulse" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-5 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                              <Icon icon={Bell} className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
                            <p className="text-xs text-muted-foreground">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mx-2 h-6 w-px bg-border" />

              <ThemeToggle />

              {/* User Menu */}
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
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{userName}</p>
                            {userEmail && (
                              <p className="text-xs text-muted-foreground">{userEmail}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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

          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    );
  }
);
MonitorLayout.displayName = "MonitorLayout";

export { MonitorLayout };














