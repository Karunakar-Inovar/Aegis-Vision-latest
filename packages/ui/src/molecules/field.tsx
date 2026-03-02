import * as React from "react";
import { View, type ViewProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { Label } from "../atoms/label";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface FieldProps extends ViewProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

const Field = React.forwardRef<React.ComponentRef<typeof View>, FieldProps>(
  ({ className, label, description, errorMessage, required, htmlFor, children, ...props }, ref) => (
    <View ref={ref} className={cn("gap-2", className)} {...props}>
      {label ? (
        <Label htmlFor={htmlFor} className="flex flex-row items-center gap-1 text-sm font-medium">
          {label}
          {required && <Text className="text-destructive">*</Text>}
        </Label>
      ) : null}
      {children}
      {description && !errorMessage ? (
        <Text className="text-sm text-muted-foreground">{description}</Text>
      ) : null}
      {errorMessage ? (
        <Text className="text-sm text-destructive" accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  )
);
Field.displayName = "Field";

export { Field };









