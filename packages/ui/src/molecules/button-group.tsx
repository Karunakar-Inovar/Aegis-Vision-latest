import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

export interface ButtonGroupProps extends ViewProps {
  direction?: "horizontal" | "vertical";
  separated?: boolean;
}

const ButtonGroup = React.forwardRef<React.ComponentRef<typeof View>, ButtonGroupProps>(
  ({ className, direction = "horizontal", separated = false, ...props }, ref) => (
    <View
      ref={ref}
      accessibilityRole="group"
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        !separated && "rounded-md shadow-sm",
        className
      )}
      {...props}
    />
  )
);
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupItemProps extends ViewProps {}

const ButtonGroupItem = React.forwardRef<React.ComponentRef<typeof View>, ButtonGroupItemProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("flex", className)} {...props} />
  )
);
ButtonGroupItem.displayName = "ButtonGroupItem";

export { ButtonGroup, ButtonGroupItem };









