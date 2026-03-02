"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../organisms/sheet";
import {
  Bell,
  Users,
  AlertTriangle,
  Settings,
  X,
} from "../utils/icons";

interface MoreMenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const moreMenuItems: MoreMenuItem[] = [
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    description: "Manage alert channels",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "User management",
  },
  {
    title: "Incidents",
    href: "/admin/incidents",
    icon: AlertTriangle,
    description: "Review incidents",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System settings",
  },
];

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MoreMenuSheet = React.forwardRef<HTMLDivElement, MoreMenuSheetProps>(
  ({ open, onOpenChange }, ref) => {
    const pathname = usePathname();

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-x border-border p-0"
        >
          <SheetHeader className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle>More Options</SheetTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1 hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <Icon icon={X} className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>

          <div className="px-6 py-4">
            <div className="space-y-1">
              {moreMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon icon={item.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);
MoreMenuSheet.displayName = "MoreMenuSheet";

export { MoreMenuSheet };

