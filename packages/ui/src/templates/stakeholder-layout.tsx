"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/theme-toggle";
import { Eye, Bell, LogOut, BarChart, FileText, User } from "../utils/icons";

interface StakeholderLayoutProps {
  children: React.ReactNode;
  currentPath?: string | null;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  logoutLabel?: string;
  userMenuTitle?: string;
}

const StakeholderLayout = React.forwardRef<HTMLDivElement, StakeholderLayoutProps>(
  (
    {
      children,
      currentPath,
      userName = "Stakeholder",
      userEmail = "stakeholder@aegis.com",
      onLogout,
      logoutLabel,
      userMenuTitle,
    },
    ref
  ) => {
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    return (
      <div ref={ref} className="flex h-screen w-full flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/stakeholder/reports" className="flex items-center gap-2">
              <Icon icon={Eye} className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Aegis Vision</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/stakeholder/reports"
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentPath === "/stakeholder/reports" &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <Icon icon={FileText} className="h-4 w-4" />
                Reports
              </Link>
              <Link
                href="/stakeholder/analytics"
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentPath === "/stakeholder/analytics" &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <Icon icon={BarChart} className="h-4 w-4" />
                Analytics
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Notifications">
              <Icon icon={Bell} className="h-5 w-5" />
            </Button>

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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    );
  }
);
StakeholderLayout.displayName = "StakeholderLayout";

export { StakeholderLayout };














