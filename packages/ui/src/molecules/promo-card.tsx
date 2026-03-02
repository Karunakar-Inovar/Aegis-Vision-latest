import * as React from "react";
import { View, Text, Pressable, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { Icon } from "../atoms/icon";
import { Button } from "../atoms/button";
import { X, Zap } from "../utils/icons";
import type { LucideIcon } from "../utils/icons";

cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });
cssInterop(Pressable, { className: "style" });

export interface PromoCardProps extends ViewProps {
  /** Icon to display (optional, not displayed by default) */
  icon?: LucideIcon;
  /** Badge text - not displayed by default */
  badgeText?: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Button text */
  buttonText?: string;
  /** Glow text shown below the card */
  glowText?: string;
  /** Callback when button is pressed */
  onButtonPress?: () => void;
  /** Callback when close button is pressed */
  onClose?: () => void;
  /** Whether the card is dismissible */
  dismissible?: boolean;
  /** Additional class names */
  className?: string;
}

const PromoCard = React.forwardRef<React.ComponentRef<typeof View>, PromoCardProps>(
  (
    {
      icon,
      badgeText = "Coming Soon",
      title,
      description,
      buttonText = "Request Early Access",
      glowText,
      onButtonPress,
      onClose,
      dismissible = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <View
        ref={ref}
        className={cn("relative pb-10", className)}
        {...props}
      >
        {/* Glow effect behind card - more prominent */}
        <View 
          className="absolute inset-x-4 bottom-6 h-16 rounded-3xl"
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.8,
            shadowRadius: 40,
            elevation: 20,
          }}
        />
        
        {/* Glow text below card */}
        {glowText && (
          <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-center gap-2 py-2">
            <Icon icon={Zap} className="h-4 w-4 text-primary" />
            <Text className="text-sm font-medium text-primary">{glowText}</Text>
          </View>
        )}

        {/* Main card with glassmorphism effect */}
        <View
          className={cn(
            "relative z-10 rounded-2xl overflow-hidden",
            "bg-slate-800 dark:bg-slate-900",
            "border border-slate-700/50",
          )}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="p-5 pt-4">
            {/* Header row with badge and close */}
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {badgeText ? (
                  <View className="rounded-full bg-slate-700/70 px-2.5 py-1 border border-slate-600/60">
                    <Text className="text-[11px] font-semibold text-slate-200">
                      {badgeText}
                    </Text>
                  </View>
                ) : null}
              </View>

              {dismissible && onClose && (
                <Pressable
                  onPress={onClose}
                  className="ml-2 p-1.5 rounded-full bg-slate-700/70 hover:bg-slate-600/70 border border-slate-600/60"
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss"
                >
                  <Icon icon={X} className="h-3.5 w-3.5 text-slate-200" />
                </Pressable>
              )}
            </View>

            {/* Title */}
            <Text className="text-lg font-bold text-white mb-1.5">
              {title}
            </Text>

            {/* Description */}
            <Text className="text-sm text-slate-400 mb-4 leading-relaxed">
              {description}
            </Text>

            {/* Action Button */}
            <Pressable
              onPress={onButtonPress}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-white active:bg-slate-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              accessibilityRole="button"
            >
              <Text className="text-sm font-semibold text-slate-900 text-center">
                {buttonText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
);

PromoCard.displayName = "PromoCard";

export { PromoCard };

