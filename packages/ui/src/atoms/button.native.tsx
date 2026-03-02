import * as React from "react";
import { Pressable, type PressableProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

cssInterop(Pressable, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

const textSizeClasses: Record<
  NonNullable<ButtonVariantProps["size"]>,
  string
> = {
  default: "text-sm",
  sm: "text-xs",
  lg: "text-base",
  icon: "text-base",
  "icon-sm": "text-sm",
  "icon-lg": "text-lg",
};

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    ButtonVariantProps {
  children?: React.ReactNode;
  textClassName?: string;
}

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, textClassName, ...props }, ref) => {
    const resolvedSize = size ?? "default";
    const content =
      typeof children === "string" ? (
        <Text className={cn(textSizeClasses[resolvedSize], textClassName)}>{children}</Text>
      ) : (
        children
      );

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {content}
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
