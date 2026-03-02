"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/theme-toggle";
import { SidebarNav, type NavItem } from "../molecules/sidebar-nav";
import { PromoCard } from "../molecules/promo-card";
import { BottomNav } from "../molecules/bottom-nav";
import { MoreMenuSheet } from "../molecules/more-menu-sheet";
import {
  Eye,
  Home,
  Camera,
  GitBranch,
  Bell,
  Users,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "../utils/icons";
import { ROUTES } from "app/constants";

interface AdminLayoutProps {
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
}

const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: Home,
  },
  {
    title: "Cameras",
    href: "/admin/cameras",
    icon: Camera,
  },
  {
    title: "AI Models",
    href: "/admin/models",
    icon: Sparkles,
  },
  {
    title: "Pipelines",
    href: "/admin/pipelines",
    icon: GitBranch,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Incidents",
    href: "/admin/incidents",
    icon: AlertTriangle,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const AdminLayout = React.forwardRef<HTMLDivElement, AdminLayoutProps>(
  (
    {
      children,
      currentPath,
      userName = "Admin User",
      userEmail = "admin@aegis.com",
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
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [showPromo, setShowPromo] = React.useState(true);

    const promoStorageKey = React.useMemo(
      () =>
        `aegis-admin-promo-dismissed-${userEmail ?? "anonymous"}`,
      [userEmail]
    );

    // Reset promo visibility when the user changes (e.g., new login)
    React.useEffect(() => {
      setShowPromo(true);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem(promoStorageKey);
        } catch {
          // Ignore storage failures; state reset still applies
        }
      }
    }, [promoStorageKey]);

    React.useEffect(() => {
      // Respect a previous dismissal within the same session
      const stored = typeof window !== "undefined"
        ? window.sessionStorage.getItem(promoStorageKey)
        : null;
      if (stored === "true") {
        setShowPromo(false);
      }
    }, [promoStorageKey]);

    const handlePromoClose = React.useCallback(() => {
      setShowPromo(false);
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(promoStorageKey, "true");
        }
      } catch {
        // Ignore storage failures; dismissal is still applied in state
      }
    }, [promoStorageKey]);

    return (
      <div ref={ref} className="flex h-screen w-full overflow-hidden bg-background">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
            "fixed lg:static inset-y-0 left-0 z-50",
            collapsed ? "w-16" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo & Brand with Collapse Toggle */}
          <div className={cn(
            "flex h-16 items-center",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}>
            {collapsed ? (
              /* Collapsed: Show logo with expand arrow indicator */
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-1 p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                title="Expand sidebar"
              >
                {logoSrc ? (
                  <>
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      width={logoWidth}
                      height={logoHeight}
                      className={cn(
                        "h-8 w-auto object-contain",
                        logoSrcDark && "dark:hidden"
                      )}
                      priority
                    />
                    {logoSrcDark && (
                      <Image
                        src={logoSrcDark}
                        alt={logoAlt}
                        width={logoWidth}
                        height={logoHeight}
                        className="hidden h-8 w-auto object-contain dark:block"
                        priority
                      />
                    )}
                  </>
                ) : (
                  <Icon icon={Eye} className="h-7 w-7 text-sidebar-primary" />
                )}
                <Icon icon={ChevronRight} className="h-4 w-4 text-sidebar-foreground/50" />
              </button>
            ) : (
              /* Expanded: Show logo, brand name, and toggle */
              <>
                <div className="flex items-center gap-2">
                  {logoSrc ? (
                    <>
                      <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={logoWidth}
                        height={logoHeight}
                        className={cn(
                          "h-8 w-auto object-contain",
                          logoSrcDark && "dark:hidden"
                        )}
                        priority
                      />
                      {logoSrcDark && (
                        <Image
                          src={logoSrcDark}
                          alt={logoAlt}
                          width={logoWidth}
                          height={logoHeight}
                          className="hidden h-8 w-auto object-contain dark:block"
                          priority
                        />
                      )}
                    </>
                  ) : (
                    <Icon icon={Eye} className="h-8 w-8 text-sidebar-primary" />
                  )}
                  <span className="sr-only">Aegis Vision</span>
                </div>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                  title="Collapse sidebar"
                >
                  <Icon
                    icon={ChevronLeft}
                    className="h-4 w-4 text-sidebar-foreground/70"
                  />
                </button>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {!collapsed ? (
              <div onClickCapture={() => setMobileMenuOpen(false)}>
              <SidebarNav items={defaultNavItems} currentPath={currentPath} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {defaultNavItems.map((item) => (
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

          {/* Promo Card */}
          {!collapsed && showPromo && (
            <div className="border-t border-sidebar-border px-3 py-3">
              <PromoCard
                title="Advanced AI Features"
                description="Bring your own models or create custom AI models without code"
                buttonText="Request Early Access"
                glowText="Unlock AI Power"
                onButtonPress={() => {}}
                dismissible
                onClose={handlePromoClose}
              />
            </div>
          )}

        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between bg-background px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
                title="Toggle menu"
              >
                <Icon icon={mobileMenuOpen ? ChevronLeft : ChevronRight} className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
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
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold"
                    style={{ color: '#ffffff', backgroundColor: '#2563eb' }}
                  >
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {notificationsOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40 animate-in fade-in-0"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full z-50 mt-3 w-96 rounded-xl border border-border/50 bg-popover shadow-2xl animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
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
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
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

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 pb-20 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        <BottomNav onMoreClick={() => setMoreMenuOpen(true)} />

        {/* More Menu Bottom Sheet */}
        <MoreMenuSheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
      </div>
    );
  }
);
AdminLayout.displayName = "AdminLayout";

export { AdminLayout };









