import React from "react";
import { View as ReactNativeView, ViewProps as RNViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

export interface ViewProps extends RNViewProps {
  className?: string;
}

cssInterop(ReactNativeView, {
  className: "style",
});

export const View = React.forwardRef<React.ComponentRef<typeof ReactNativeView>, ViewProps>(
  ({ children, className, ...props }, ref) => (
    <ReactNativeView ref={ref} className={cn(className)} {...props}>
      {children}
    </ReactNativeView>
  )
);

View.displayName = "View";

