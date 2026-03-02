import * as React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface InputGroupProps extends ViewProps {}

const InputGroup = React.forwardRef<React.ComponentRef<typeof View>, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex w-full flex-row items-stretch overflow-hidden rounded-md border border-input bg-background text-sm",
        className
      )}
      {...props}
    />
  )
);
InputGroup.displayName = "InputGroup";

export interface InputGroupTextProps extends TextProps {}

const InputGroupText = React.forwardRef<React.ComponentRef<typeof Text>, InputGroupTextProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        "flex items-center px-3 text-sm font-medium text-muted-foreground bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);
InputGroupText.displayName = "InputGroupText";

export interface InputGroupSuffixProps extends TextProps {}

const InputGroupSuffix = React.forwardRef<React.ComponentRef<typeof Text>, InputGroupSuffixProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        "flex items-center px-3 text-sm font-medium text-muted-foreground bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);
InputGroupSuffix.displayName = "InputGroupSuffix";

export { InputGroup, InputGroupText, InputGroupSuffix };





