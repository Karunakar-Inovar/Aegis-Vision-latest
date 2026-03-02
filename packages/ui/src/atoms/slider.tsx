import * as React from "react";
import {
  View,
  Pressable,
  PanResponder,
  type GestureResponderEvent,
  type ViewProps,
} from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Pressable, {
  className: "style",
});

export interface SliderProps extends Omit<ViewProps, "onLayout"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  trackClassName?: string;
  thumbClassName?: string;
}

const Slider = React.forwardRef<View, SliderProps>(
  (
    {
      className,
      trackClassName,
      thumbClassName,
      value,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      onValueChange,
      onLayout,
      ...props
    },
    ref
  ) => {
    const isControlled = typeof value === "number";
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [trackWidth, setTrackWidth] = React.useState(0);

    React.useEffect(() => {
      if (isControlled && typeof value === "number") {
        setInternalValue(value);
      }
    }, [isControlled, value]);

    const clampValue = React.useCallback(
      (raw: number) => {
        const clamped = Math.min(max, Math.max(min, raw));
        if (step <= 0) return clamped;
        const stepped = Math.round((clamped - min) / step) * step + min;
        return Number(stepped.toFixed(5));
      },
      [min, max, step]
    );

    const currentValue = isControlled ? (value as number) : internalValue;
    const range = Math.max(1e-6, max - min);
    const percentage = ((currentValue - min) / range) * 100;

    const updateValue = React.useCallback(
      (next: number) => {
        const clamped = clampValue(next);
        if (!isControlled) {
          setInternalValue(clamped);
        }
        onValueChange?.(clamped);
      },
      [clampValue, isControlled, onValueChange]
    );

    const updateFromPosition = React.useCallback(
      (positionX: number) => {
        if (!trackWidth) return;
        const ratio = Math.min(1, Math.max(0, positionX / trackWidth));
        const next = min + ratio * range;
        updateValue(next);
      },
      [trackWidth, min, range, updateValue]
    );

    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => !disabled,
          onMoveShouldSetPanResponder: () => !disabled,
          onPanResponderGrant: (evt) => updateFromPosition(evt.nativeEvent.locationX),
          onPanResponderMove: (evt) => updateFromPosition(evt.nativeEvent.locationX),
        }),
      [disabled, updateFromPosition]
    );

    const handlePress = (event: GestureResponderEvent) => {
      if (disabled) return;
      updateFromPosition(event.nativeEvent.locationX);
    };

    return (
      <View ref={ref} className={cn("w-full", className)} {...props}>
        <Pressable
          className={cn("relative h-1.5 w-full rounded-full bg-secondary", trackClassName)}
          onLayout={(event) => {
            setTrackWidth(event.nativeEvent.layout.width);
            onLayout?.(event);
          }}
          onPress={handlePress}
          accessibilityRole="adjustable"
          accessibilityState={{ disabled }}
          accessibilityValue={{ min, max, now: currentValue }}
          {...panResponder.panHandlers}
        >
          <View
            className="absolute left-0 top-0 h-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
          <View
            pointerEvents="none"
            className={cn(
              "absolute -top-2 h-4 w-4 rounded-full border-2 border-primary bg-background shadow",
              disabled && "opacity-50",
              thumbClassName
            )}
            style={{
              left: `${Math.min(100, Math.max(0, percentage))}%`,
              marginLeft: -8,
            }}
          />
        </Pressable>
      </View>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };


