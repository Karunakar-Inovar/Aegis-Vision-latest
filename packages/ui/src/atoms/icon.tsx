import * as React from "react";
import { type LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "../../utils/cn";

export interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: number | string;
  className?: string;
}

/**
 * Icon component wrapper for consistent icon usage
 * 
 * @example
 * ```tsx
 * import { Icon } from "ui";
 * import { Eye } from "lucide-react";
 * 
 * <Icon icon={Eye} size={24} className="text-primary" />
 * ```
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 20, className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        size={size}
        className={cn("inline-flex", className)}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";














