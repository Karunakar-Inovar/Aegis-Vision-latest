import * as React from "react";
import { Pressable, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { useControllableState } from "../utils/use-controllable-state";

cssInterop(Pressable, {
  className: "style",
});

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-input",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4",
      },
      state: {
        on: "bg-accent text-accent-foreground",
        off: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "off",
    },
  }
);

export interface ToggleProps
  extends Omit<PressableProps, "onPress">,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<Pressable, ToggleProps>(
  (
    {
      className,
      variant,
      size,
      pressed,
      defaultPressed = false,
      onPressedChange,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useControllableState<boolean>({
      value: pressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });

    const handlePress = () => {
      if (disabled) return;
      setIsPressed(!isPressed);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="switch"
        accessibilityState={{ checked: isPressed, disabled }}
        className={cn(
          toggleVariants({ variant, size, state: isPressed ? "on" : "off", className }),
          disabled && "pointer-events-none"
        )}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };









