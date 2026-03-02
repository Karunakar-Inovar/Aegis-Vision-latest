"use client";

import * as React from "react";
import { Pressable, View, Platform } from "react-native";
import { cn } from "../utils/cn";

export interface ToggleSwitchProps {
  /** Whether the switch is checked/on */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when the switch value changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names for the container */
  className?: string;
  /** ID for the switch (useful for labels) */
  id?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

const sizeConfig = {
  sm: {
    track: "h-5 w-9",
    thumb: "h-3.5 w-3.5",
    thumbChecked: "peer-checked:translate-x-4",
    thumbOffset: "left-[3px] top-[3px]",
  },
  md: {
    track: "h-7 w-12",
    thumb: "h-5 w-5",
    thumbChecked: "peer-checked:translate-x-5",
    thumbOffset: "left-1 top-1",
  },
  lg: {
    track: "h-8 w-16",
    thumb: "h-6 w-6",
    thumbChecked: "peer-checked:translate-x-8",
    thumbOffset: "left-1 top-1",
  },
};

const ToggleSwitch = React.forwardRef<View, ToggleSwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      size = "md",
      className,
      id,
      accessibilityLabel,
    },
    ref
  ) => {
    // Support both controlled and uncontrolled usage
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const sizes = sizeConfig[size];

    const handleToggle = () => {
      if (disabled) return;

      if (!isControlled) {
        setInternalChecked(!isChecked);
      }
      onCheckedChange?.(!isChecked);
    };

    // For web, use native checkbox for better accessibility
    if (Platform.OS === "web") {
      // Get translate class based on checked state
      const getThumbTranslate = () => {
        if (size === "sm") {
          return isChecked ? "translate-x-4" : "translate-x-0";
        } else if (size === "md") {
          return isChecked ? "translate-x-5" : "translate-x-0";
        } else {
          return isChecked ? "translate-x-8" : "translate-x-0";
        }
      };

      return (
        <label
          className={cn(
            "relative inline-flex cursor-pointer items-center",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <input
            type="checkbox"
            id={id}
            className="peer sr-only"
            checked={isChecked}
            onChange={(e) => {
              if (!disabled) {
                if (!isControlled) {
                  setInternalChecked(e.target.checked);
                }
                onCheckedChange?.(e.target.checked);
              }
            }}
            disabled={disabled}
            aria-label={accessibilityLabel}
          />
          {/* Track container - relative positioning for thumb */}
          <div className={cn("relative", sizes.track)}>
            {/* Track background */}
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-colors duration-200",
                isChecked 
                  ? "bg-indigo-600 dark:bg-indigo-500" 
                  : "bg-slate-300 dark:bg-slate-600",
                "peer-focus:ring-2 peer-focus:ring-indigo-500/50 peer-focus:ring-offset-2"
              )}
            />
            {/* Thumb - positioned relative to track with translate */}
            <span
              className={cn(
                "absolute rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                sizes.thumb,
                sizes.thumbOffset,
                getThumbTranslate()
              )}
            />
          </div>
        </label>
      );
    }

    // For native (iOS/Android)
    return (
      <Pressable
        ref={ref}
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: isChecked, disabled }}
        accessibilityLabel={accessibilityLabel}
        className={cn(
          "relative",
          disabled && "opacity-50",
          className
        )}
      >
        {/* Track container */}
        <View className={cn("relative", sizes.track)}>
          {/* Track background */}
          <View
            className={cn(
              "absolute inset-0 rounded-full",
              isChecked ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
            )}
          />
          {/* Thumb */}
          <View
            className={cn(
              "absolute rounded-full bg-white",
              sizes.thumb,
              size === "sm" ? "top-[3px]" : "top-1",
              isChecked
                ? size === "sm"
                  ? "left-[19px]"
                  : size === "md"
                  ? "left-[25px]"
                  : "left-[37px]"
                : size === "sm"
                ? "left-[3px]"
                : "left-1"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </View>
      </Pressable>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };

