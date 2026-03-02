import * as React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  AccessibilityState,
} from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(Pressable, {
  className: "style",
});

cssInterop(View, {
  className: "style",
});

export interface CheckboxProps extends Omit<PressableProps, "onPress"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  className?: string;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof Pressable>, CheckboxProps>(
  ({ className, checked = false, indeterminate = false, onCheckedChange, accessibilityState, disabled, ...props }, ref) => {
    const { checked: _ignoredChecked, ...restAccessibilityState } = accessibilityState ?? {};
    const nextState: AccessibilityState = {
      checked: indeterminate ? "mixed" : checked,
      disabled,
      ...restAccessibilityState,
    };

    const handlePress = () => {
      if (disabled) return;
      const next = indeterminate ? true : !checked;
      onCheckedChange?.(next);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="checkbox"
        accessibilityState={nextState}
        className={cn(
          "h-4 w-4 items-center justify-center rounded-sm border border-input",
          checked || indeterminate ? "bg-primary" : "bg-background",
          disabled && "opacity-50",
          className
        )}
        onPress={handlePress}
        disabled={disabled}
        {...props}
      >
        {(checked || indeterminate) ? (
          <View
            className={cn(
              "h-2 w-2 rotate-45 border-b-2 border-r-2",
              indeterminate ? "border-primary-foreground/70" : "border-primary-foreground"
            )}
          />
        ) : null}
      </Pressable>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };


