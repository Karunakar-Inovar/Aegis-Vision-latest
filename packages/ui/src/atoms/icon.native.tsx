import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { cn } from "../../utils/cn";

export interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: number | string;
  className?: string;
}

/**
 * Native Icon wrapper for lucide-react-native
 */
export const Icon = React.forwardRef<any, IconProps>(
  ({ icon: IconComponent, size = 20, className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        size={size as any}
        className={cn(className)}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";










