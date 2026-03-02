import * as React from "react";
import { Text, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(Text, {
  className: "style",
});

export interface KbdProps extends TextProps {}

const Kbd = React.forwardRef<React.ComponentRef<typeof Text>, KbdProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        "rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);
Kbd.displayName = "Kbd";

export { Kbd };


