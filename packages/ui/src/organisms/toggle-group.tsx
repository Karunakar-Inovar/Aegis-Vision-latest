import * as React from "react";
import { View, Pressable, type ViewProps, type PressableProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { useControllableState } from "../utils/use-controllable-state";

cssInterop(View, {
  className: "style",
});

cssInterop(Pressable, {
  className: "style",
});

type ToggleGroupType = "single" | "multiple";

interface ToggleGroupContextValue {
  type: ToggleGroupType;
  value: string | string[] | undefined;
  setValue: (value: string) => void;
  isItemOn: (value: string) => boolean;
  allowEmpty: boolean;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps extends ViewProps {
  type?: ToggleGroupType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  allowEmpty?: boolean;
}

const ToggleGroup = React.forwardRef<View, ToggleGroupProps>(
  (
    {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      className,
      allowEmpty = false,
      children,
      ...props
    },
    ref
  ) => {
    const [currentValue, setCurrentValue] = useControllableState<string | string[] | undefined>({
      value,
      defaultValue:
        typeof defaultValue !== "undefined"
          ? defaultValue
          : type === "single"
          ? ""
          : [],
      onChange: onValueChange as (val: string | string[]) => void,
    });

    const ctx = React.useMemo<ToggleGroupContextValue>(() => {
      const normalizedValue =
        type === "single"
          ? (currentValue as string | undefined)
          : Array.isArray(currentValue)
          ? currentValue
          : [];

      const isItemOn = (itemValue: string) => {
        if (type === "single") {
          return normalizedValue === itemValue;
        }
        return normalizedValue.includes(itemValue);
      };

      const setValue = (itemValue: string) => {
        if (type === "single") {
          const nextValue = normalizedValue === itemValue ? (allowEmpty ? "" : itemValue) : itemValue;
          setCurrentValue(nextValue);
        } else {
          const values = normalizedValue as string[];
          const isSelected = values.includes(itemValue);
          const nextValues = isSelected
            ? values.filter((v) => v !== itemValue)
            : [...values, itemValue];
          if (!allowEmpty && nextValues.length === 0) {
            return;
          }
          setCurrentValue(nextValues);
        }
      };

      return {
        type,
        value: normalizedValue,
        setValue,
        isItemOn,
        allowEmpty,
      };
    }, [type, currentValue, setCurrentValue, allowEmpty]);

    return (
      <ToggleGroupContext.Provider value={ctx}>
        <View ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props}>
          {children}
        </View>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps extends PressableProps {
  value: string;
  disabled?: boolean;
}

const ToggleGroupItem = React.forwardRef<Pressable, ToggleGroupItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const ctx = React.useContext(ToggleGroupContext);
    if (!ctx) {
      throw new Error("ToggleGroupItem must be used within a ToggleGroup");
    }

    const isOn = ctx.isItemOn(value);

    const handlePress = () => {
      if (disabled) return;
      ctx.setValue(value);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected: isOn, disabled }}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition",
          isOn ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
          disabled && "opacity-50",
          className
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
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };









