import * as React from "react";
import { View, Pressable, type ViewProps, type PressableProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { useControllableState } from "../utils/use-controllable-state";

cssInterop(View, {
  className: "style",
});

cssInterop(Pressable, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

interface RadioGroupContextValue {
  value?: string;
  setValue: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [currentValue, setCurrentValue] = useControllableState<string | undefined>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
    });

    const ctx = React.useMemo(
      () => ({
        value: currentValue,
        setValue: (next: string) => setCurrentValue(next),
      }),
      [currentValue, setCurrentValue]
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        <View ref={ref} className={cn("gap-3", className)} {...props}>
          {children}
        </View>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends PressableProps {
  value: string;
  disabled?: boolean;
  label?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<Pressable, RadioGroupItemProps>(
  ({ className, value, disabled, children, label, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) {
      throw new Error("RadioGroupItem must be used within a RadioGroup");
    }

    const isSelected = ctx.value === value;

    const handlePress = () => {
      if (disabled) return;
      ctx.setValue(value);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected, disabled }}
        className={cn("flex flex-row items-center gap-2", disabled && "opacity-50", className)}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      >
        <View
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-input items-center justify-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isSelected && "border-primary"
          )}
        >
          {isSelected ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
        </View>
        {children ?? (label ? <Text className="text-sm text-foreground">{label}</Text> : null)}
      </Pressable>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };









