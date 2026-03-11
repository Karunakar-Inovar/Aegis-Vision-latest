"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
// Icons
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "../utils/icons";
import { ROUTES } from "app/constants";

export interface ExecutiveSidebarProps {
  currentPath?: string | null;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  logoSrc?: string;
  logoSrcDark?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  onMobileNavClose?: () => void;
  mobileMenuOpen?: boolean;
}

const executiveNavItems = [
  { title: "Dashboard", href: ROUTES.EXECUTIVE.DASHBOARD, icon: LayoutDashboard },
  { title: "Insights", href: ROUTES.EXECUTIVE.INSIGHTS, icon: TrendingUp },
  { title: "Incidents", href: ROUTES.EXECUTIVE.INCIDENTS, icon: AlertTriangle },
  { title: "Alerts", href: ROUTES.EXECUTIVE.ALERTS, icon: Bell },
  { title: "Reports", href: ROUTES.EXECUTIVE.REPORTS, icon: FileText },
  { title: "Settings", href: ROUTES.EXECUTIVE.SETTINGS, icon: Settings },
];

const ExecutiveSidebar = React.forwardRef<HTMLDivElement, ExecutiveSidebarProps>(
  (
    {
      currentPath,
      collapsed = false,
      onCollapseToggle,
      logoSrc = "/AegisVision-logo.svg",
      logoSrcDark = "/AegisVision-logo-dark.svg",
      logoAlt = "Aegis Vision",
      logoWidth = 157,
      logoHeight = 32,
      onMobileNavClose,
      mobileMenuOpen = false,
    },
    ref
  ) => {
    const normalizePath = (path?: string | null) =>
      (path || "").replace(/\/+$/, "") || "/";

    const isPathActive = (href: string) => {
      const normalizedHref = normalizePath(href);
      const normalizedCurrent = normalizePath(currentPath);
      return (
        normalizedCurrent === normalizedHref ||
        normalizedCurrent.startsWith(`${normalizedHref}/`)
      );
    };

    return (
      <aside
        ref={ref}
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300",
          "fixed lg:static inset-y-0 left-0 z-50",
          collapsed ? "w-16" : "w-[260px]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Brand with Collapse Toggle */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-gray-200",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {collapsed ? (
            <button
              onClick={onCollapseToggle}
              className="flex items-center gap-1 rounded-md p-1.5 transition-colors hover:bg-gray-100"
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
              ) : null}
              <Icon icon={ChevronRight} className="h-4 w-4 text-gray-500" />
            </button>
          ) : (
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
                ) : null}
                <span className="sr-only">{logoAlt}</span>
              </div>
              <button
                onClick={onCollapseToggle}
                className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                title="Collapse sidebar"
              >
                <Icon
                  icon={ChevronLeft}
                  className="h-4 w-4 text-gray-500"
                />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed ? (
            <nav
              className="flex flex-col gap-1"
              onClickCapture={onMobileNavClose}
            >
              {executiveNavItems.map((item) => {
                const isActive = isPathActive(item.href);
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                      "text-gray-600 hover:bg-gray-100",
                      isActive && "bg-indigo-50 text-indigo-600 font-medium"
                    )}
                  >
                    <Icon
                      icon={item.icon}
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-indigo-600" : "text-gray-600"
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="flex flex-col gap-2">
              {executiveNavItems.map((item) => {
                const isActive = isPathActive(item.href);
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onMobileNavClose}
                    className={cn(
                      "flex items-center justify-center rounded-lg p-2 transition-colors",
                      "hover:bg-gray-100",
                      isActive && "bg-indigo-50 text-indigo-600"
                    )}
                    title={item.title}
                  >
                    <Icon
                      icon={item.icon}
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-indigo-600" : "text-gray-600"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark Promo Card - Bottom of sidebar */}
        {!collapsed && (
          <div className="border-t border-gray-200 px-3 py-3">
            <div
              className="rounded-xl overflow-hidden p-4"
              style={{ backgroundColor: "#1E1E2E" }}
            >
              <span className="rounded-full border border-gray-500 px-3 py-0.5 text-xs font-medium text-gray-400">
                Coming Soon
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">
                Advanced AI Features
              </h3>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                Bring your own models or create custom AI models without code
              </p>
              <button
                type="button"
                className="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                Request Early Access
              </button>
            </div>
            <a
              href="#"
              className="mt-2 flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Icon icon={Zap} className="h-4 w-4" />
              Unlock AI Power
            </a>
          </div>
        )}
      </aside>
    );
  }
);

ExecutiveSidebar.displayName = "ExecutiveSidebar";

export { ExecutiveSidebar };
