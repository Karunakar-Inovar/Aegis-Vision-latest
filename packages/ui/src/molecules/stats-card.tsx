import * as React from "react";
import { View, Text, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });

export type StatsCardColor = "green" | "purple" | "blue" | "orange" | "red" | "amber" | "default";

export interface StatsCardProps extends ViewProps {
  /** The label/title of the stat */
  label: string;
  /** The main value to display */
  value: string | number;
  /** Optional suffix text (e.g., "avg", "events") */
  suffix?: string;
  /** Optional badge text (e.g., "Online", "Normal") */
  badge?: string;
  /** Color variant for gradient background */
  color?: StatsCardColor;
  /** Additional class names */
  className?: string;
}

const colorConfig = {
  default: {
    gradient: "from-gray-500/10 via-gray-400/5 to-transparent",
    gradientDark: "dark:from-gray-500/10 dark:via-gray-400/5",
    sweepGradient: "from-transparent via-white/25 to-transparent",
    border: "border-border",
    badge: "bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    accent: "text-foreground",
  },
  green: {
    gradient: "from-green-500/20 via-green-400/10 to-transparent",
    gradientDark: "dark:from-green-500/15 dark:via-green-400/5",
    sweepGradient: "from-transparent via-green-400/30 to-transparent",
    border: "border-green-300 dark:border-green-700/60",
    badge: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    accent: "text-green-600 dark:text-green-400",
  },
  purple: {
    gradient: "from-purple-500/20 via-purple-400/10 to-transparent",
    gradientDark: "dark:from-purple-500/15 dark:via-purple-400/5",
    sweepGradient: "from-transparent via-purple-400/30 to-transparent",
    border: "border-purple-300 dark:border-purple-700/60",
    badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    accent: "text-purple-600 dark:text-purple-400",
  },
  blue: {
    gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
    gradientDark: "dark:from-blue-500/15 dark:via-blue-400/5",
    sweepGradient: "from-transparent via-blue-400/30 to-transparent",
    border: "border-blue-300 dark:border-blue-700/60",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accent: "text-blue-600 dark:text-blue-400",
  },
  orange: {
    gradient: "from-orange-500/20 via-orange-400/10 to-transparent",
    gradientDark: "dark:from-orange-500/15 dark:via-orange-400/5",
    sweepGradient: "from-transparent via-orange-400/30 to-transparent",
    border: "border-orange-300 dark:border-orange-700/60",
    badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    accent: "text-orange-600 dark:text-orange-400",
  },
  amber: {
    gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
    gradientDark: "dark:from-amber-500/15 dark:via-amber-400/5",
    sweepGradient: "from-transparent via-amber-400/30 to-transparent",
    border: "border-amber-300 dark:border-amber-700/60",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accent: "text-amber-600 dark:text-amber-400",
  },
  red: {
    gradient: "from-red-500/20 via-red-400/10 to-transparent",
    gradientDark: "dark:from-red-500/15 dark:via-red-400/5",
    sweepGradient: "from-transparent via-red-400/30 to-transparent",
    border: "border-red-300 dark:border-red-700/60",
    badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    accent: "text-red-600 dark:text-red-400",
  },
};

const StatsCard = React.forwardRef<React.ComponentRef<typeof View>, StatsCardProps>(
  (
    {
      label,
      value,
      suffix,
      badge,
      color = "default",
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorConfig[color];

    return (
      <View
        ref={ref}
        className={cn(
          // Base card styles
          "relative overflow-hidden rounded-2xl border bg-card group",
          // Color-matched border
          colors.border,
          // Smooth transitions
          "transition-all duration-300 ease-out",
          className
        )}
        style={{
          // For native shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
        {...props}
      >
        {/* Static Gradient Background */}
        <View
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            colors.gradient,
            colors.gradientDark
          )}
        />
        
        {/* Animated Gradient Sweep (left to right on hover) */}
        <View
          className={cn(
            "absolute inset-0 w-[200%]",
            // Gradient that sweeps across - color-aware based on card color
            "bg-gradient-to-r",
            colors.sweepGradient,
            // Position off-screen left initially
            "-translate-x-full",
            // On parent hover, animate to right (moves across the card)
            "group-hover:translate-x-full",
            // Smooth animation
            "transition-transform duration-1000 ease-in-out"
          )}
        />

        {/* Content */}
        <View className="relative z-10 p-5">
          {/* Label */}
          <Text className="text-sm font-medium text-muted-foreground mb-3">
            {label}
          </Text>

          {/* Value Row */}
          <View className="flex-row items-baseline gap-2 flex-wrap">
            <Text className="text-3xl font-bold text-foreground">
              {value}
            </Text>
            
            {suffix && (
              <Text className="text-sm text-muted-foreground">
                {suffix}
              </Text>
            )}
            
            {badge && (
              <View className={cn(
                "px-2 py-0.5 rounded-full border",
                colors.badge
              )}>
                <Text className={cn("text-xs font-medium", colors.badge.split(" ").filter(c => c.startsWith("text-")).join(" "))}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
);

StatsCard.displayName = "StatsCard";

export { StatsCard };

