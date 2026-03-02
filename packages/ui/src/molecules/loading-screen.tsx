import * as React from "react";
import { View, Text, ActivityIndicator, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });

export interface LoadingScreenProps extends ViewProps {
  /** Whether the loading screen is visible */
  visible?: boolean;
  /** Optional loading message */
  message?: string;
  /** Size of the spinner */
  size?: "small" | "large";
  /** Whether to show as full-screen overlay */
  fullScreen?: boolean;
  /** Whether to show a semi-transparent backdrop */
  overlay?: boolean;
  /** Custom spinner color */
  spinnerColor?: string;
  /** Additional class names */
  className?: string;
}

const LoadingScreen = React.forwardRef<React.ComponentRef<typeof View>, LoadingScreenProps>(
  (
    {
      visible = true,
      message,
      size = "large",
      fullScreen = true,
      overlay = true,
      spinnerColor,
      className,
      ...props
    },
    ref
  ) => {
    if (!visible) return null;

    const content = (
      <View
        className={cn(
          "items-center justify-center gap-4",
          fullScreen && "flex-1",
          className
        )}
      >
        {/* Spinner Container */}
        <View className="items-center justify-center rounded-2xl bg-card p-6 shadow-lg">
          <ActivityIndicator
            size={size}
            color={spinnerColor || undefined}
            className="text-primary"
          />
          {message && (
            <Text className="mt-4 text-sm font-medium text-muted-foreground text-center">
              {message}
            </Text>
          )}
        </View>
      </View>
    );

    if (fullScreen) {
      return (
        <View
          ref={ref}
          className={cn(
            "absolute inset-0 z-50 items-center justify-center",
            overlay && "bg-background/80 backdrop-blur-sm"
          )}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          {...props}
        >
          {content}
        </View>
      );
    }

    return (
      <View ref={ref} {...props}>
        {content}
      </View>
    );
  }
);

LoadingScreen.displayName = "LoadingScreen";

// Inline loading indicator (non-fullscreen)
export interface LoadingIndicatorProps extends ViewProps {
  /** Size of the spinner */
  size?: "small" | "large";
  /** Optional loading message */
  message?: string;
  /** Custom spinner color */
  color?: string;
  /** Additional class names */
  className?: string;
}

const LoadingIndicator = React.forwardRef<React.ComponentRef<typeof View>, LoadingIndicatorProps>(
  ({ size = "small", message, color, className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("flex-row items-center justify-center gap-2", className)}
        {...props}
      >
        <ActivityIndicator size={size} color={color || undefined} className="text-primary" />
        {message && (
          <Text className="text-sm text-muted-foreground">{message}</Text>
        )}
      </View>
    );
  }
);

LoadingIndicator.displayName = "LoadingIndicator";

export { LoadingScreen, LoadingIndicator };






