import * as React from "react";
import { View, type ViewProps, ActivityIndicator } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

export interface SpinnerProps extends ViewProps {
  size?: "sm" | "default" | "lg";
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, "small" | "large"> = {
  sm: "small",
  default: "large",
  lg: "large",
};

const Spinner = ({ className, size = "default", ...props }: SpinnerProps) => {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <ActivityIndicator size={sizeMap[size]} />
    </View>
  );
};

export { Spinner };


