import * as React from "react";
import { View, type ViewProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { badgeVariants, type BadgeVariantProps } from "./badge-variants";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface BadgeProps extends ViewProps, BadgeVariantProps {
  children?: React.ReactNode;
  className?: string;
}

// Helper to wrap string/number children in Text components for React Native compatibility
function wrapTextNodes(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <Text className="text-inherit">{child}</Text>;
    }
    return child;
  });
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  // If children is just a string, render as Text directly
  if (typeof children === "string" || typeof children === "number") {
    return (
      <Text className={cn(badgeVariants({ variant }), className)}>{children}</Text>
    );
  }

  // For complex children (Icon + text), wrap in View and ensure text nodes are wrapped
  return (
    <View 
      className={cn(badgeVariants({ variant }), "flex-row items-center", className)} 
      {...props}
    >
      {wrapTextNodes(children)}
    </View>
  );
}

export { Badge, badgeVariants };


