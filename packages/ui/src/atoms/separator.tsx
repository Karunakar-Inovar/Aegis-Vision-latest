import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

export interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const Separator = React.forwardRef<React.ComponentRef<typeof View>, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <View
      ref={ref}
      accessibilityRole="none"
      accessibilityLabel={orientation === "horizontal" ? "Horizontal separator" : "Vertical separator"}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = "Separator";

export { Separator };


