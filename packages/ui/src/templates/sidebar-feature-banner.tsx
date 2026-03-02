import * as React from "react";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { cn } from "../../utils/cn";

export interface SidebarFeatureBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  badge?: string;
}

export const SidebarFeatureBanner = ({
  title,
  description,
  ctaLabel = "Learn more",
  badge = "New",
  onCtaClick,
  className,
  ...props
}: SidebarFeatureBannerProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-4 text-left",
        className
      )}
      {...props}
    >
      <Badge variant="secondary" className="mb-3">
        {badge}
      </Badge>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button variant="link" className="mt-2 px-0 text-sm" onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    </div>
  );
};














