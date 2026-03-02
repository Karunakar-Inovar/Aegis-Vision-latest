import * as React from "react";
import { ActivityIndicator, type ActivityIndicatorProps, View } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

export interface SpinnerProps extends ActivityIndicatorProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, ActivityIndicatorProps["size"]> = {
  sm: "small",
  default: "small",
  lg: "large",
};

const Spinner = ({
  className,
  size = "default",
  color,
  accessibilityLabel = "Loading",
  ...props
}: SpinnerProps) => (
  <View className={cn("inline-flex items-center justify-center", className)}>
    <ActivityIndicator
      size={sizeMap[size]}
      color={color}
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  </View>
);

export { Spinner };




