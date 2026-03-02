import React from "react";
import { Text as ReactNativeText, TextProps as RNTextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

export interface TextProps extends RNTextProps {
  className?: string;
}

cssInterop(ReactNativeText, {
  className: "style",
});

export const Text = React.forwardRef<React.ComponentRef<typeof ReactNativeText>, TextProps>(
  ({ children, className, ...props }, ref) => (
    <ReactNativeText ref={ref} className={cn(className)} {...props}>
      {children}
    </ReactNativeText>
  )
);

Text.displayName = "Text";

