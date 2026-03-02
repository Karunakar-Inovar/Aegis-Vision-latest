"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import {
  Home,
  Camera,
  Sparkles,
  GitBranch,
  MoreVertical,
} from "../utils/icons";

interface BottomNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface BottomNavProps {
  onMoreClick?: () => void;
}

const mainNavItems: BottomNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
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
    title: "Pipeline",
    href: "/admin/pipelines",
    icon: GitBranch,
  },
];

const BottomNav = React.forwardRef<HTMLDivElement, BottomNavProps>(
  ({ onMoreClick }, ref) => {
    const pathname = usePathname();

    return (
      <div
        ref={ref}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden"
      >
        <div className="flex h-16 items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon icon={item.icon} className="h-5 w-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
          <button
            onClick={onMoreClick}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon icon={MoreVertical} className="h-5 w-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>
    );
  }
);
BottomNav.displayName = "BottomNav";

export { BottomNav };

