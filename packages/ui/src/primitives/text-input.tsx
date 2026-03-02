import React from "react";
import {
  TextInput as ReactNativeTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

export interface TextInputProps extends RNTextInputProps {
  className?: string;
  variant?: "default" | "outline";
  type?: string;
}

cssInterop(ReactNativeTextInput, {
  className: "style",
});

const baseInputClasses =
  "h-10 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50";

const outlineClasses = "border-2 border-input bg-background focus-visible:border-primary";

export const TextInput = React.forwardRef<
  React.ComponentRef<typeof ReactNativeTextInput>,
  TextInputProps
>(({ className, variant = "default", type, ...props }, ref) => (
  <ReactNativeTextInput
    ref={ref}
    className={cn(baseInputClasses, variant === "outline" && outlineClasses, className)}
    {...props}
  />
));

TextInput.displayName = "TextInput";

