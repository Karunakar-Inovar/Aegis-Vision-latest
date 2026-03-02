import * as React from "react";
import Link from "next/link";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import type { LucideIcon } from "../utils/icons";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

interface SidebarNavProps {
  items: NavItem[];
  currentPath?: string;
  className?: string;
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ items, currentPath, className }, ref) => {
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

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

    const toggleExpand = (title: string) => {
      setExpandedItems((prev) =>
        prev.includes(title)
          ? prev.filter((item) => item !== title)
          : [...prev, title]
      );
    };

    return (
      <nav ref={ref} className={cn("flex flex-col gap-1", className)}>
        {items.map((item) => {
          const isActive = isPathActive(item.href);
          const isExpanded = expandedItems.includes(item.title);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.title}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon icon={item.icon} className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                  <Icon
                    icon={require("../utils/icons").ChevronDown}
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon icon={item.icon} className="h-5 w-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {item.children?.map((child) => {
                    const isChildActive = isPathActive(child.href);
                    return (
                      <Link
                        key={child.title}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isChildActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon icon={child.icon} className="h-4 w-4" />
                        <span className="flex-1">{child.title}</span>
                        {child.badge && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }
);
SidebarNav.displayName = "SidebarNav";

export { SidebarNav };














