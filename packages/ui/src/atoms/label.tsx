import * as React from "react";
import { Text, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(Text, {
  className: "style",
});

export interface LabelProps extends TextProps {
  className?: string;
  htmlFor?: string;
}

const Label = React.forwardRef<React.ComponentRef<typeof Text>, LabelProps>(
  ({ className, htmlFor, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:opacity-70",
        className
      )}
      nativeID={htmlFor}
      {...props}
    >
      {children}
    </Text>
  )
);
Label.displayName = "Label";

export { Label };


