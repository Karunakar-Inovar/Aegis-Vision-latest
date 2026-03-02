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

export interface InputGroupProps extends ViewProps {}

const InputGroup = React.forwardRef<React.ComponentRef<typeof View>, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background",
        className
      )}
      {...props}
    />
  )
);
InputGroup.displayName = "InputGroup";

export interface InputGroupTextProps extends ViewProps {
  children?: React.ReactNode;
}

const InputGroupText = React.forwardRef<React.ComponentRef<typeof View>, InputGroupTextProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex items-center px-3 text-sm font-medium text-muted-foreground border-r border-input bg-muted",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-muted-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
);
InputGroupText.displayName = "InputGroupText";

export interface InputGroupSuffixProps extends ViewProps {
  children?: React.ReactNode;
}

const InputGroupSuffix = React.forwardRef<React.ComponentRef<typeof View>, InputGroupSuffixProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex items-center px-3 text-sm font-medium text-muted-foreground border-l border-input bg-muted",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-muted-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
);
InputGroupSuffix.displayName = "InputGroupSuffix";

export { InputGroup, InputGroupText, InputGroupSuffix };









