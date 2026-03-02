import * as React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { badgeVariants, type BadgeVariantProps } from "./badge-variants";

cssInterop(Pressable, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface BadgeProps
  extends Omit<PressableProps, "children">,
    BadgeVariantProps {
  children?: React.ReactNode;
  textClassName?: string;
}

const Badge = React.forwardRef<React.ComponentRef<typeof Pressable>, BadgeProps>(
  ({ className, variant, children, textClassName, ...props }, ref) => (
    <Pressable
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      accessibilityRole="text"
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-xs font-semibold", textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };




