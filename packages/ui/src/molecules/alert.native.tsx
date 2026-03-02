import * as React from "react";
import { View, type ViewProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface AlertProps extends ViewProps {
  variant?: "default" | "destructive";
}

const baseAlertClasses =
  "relative w-full rounded-lg border px-4 py-3 text-sm bg-background text-foreground";

const Alert = React.forwardRef<React.ComponentRef<typeof View>, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        baseAlertClasses,
        variant === "destructive" && "border-destructive/50 text-destructive",
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export interface AlertTitleProps extends ViewProps {}

const AlertTitle = React.forwardRef<React.ComponentRef<typeof Text>, AlertTitleProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </Text>
  )
);
AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps extends ViewProps {}

const AlertDescription = React.forwardRef<
  React.ComponentRef<typeof Text>,
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </Text>
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };





