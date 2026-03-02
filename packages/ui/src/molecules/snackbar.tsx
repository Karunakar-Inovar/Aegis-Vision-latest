import * as React from "react";
import { View, Text, Pressable, type ViewProps, Animated, Platform } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";
import { Icon } from "../atoms/icon";
import { CheckCircle, AlertCircle, AlertTriangle, InfoIcon, X } from "../utils/icons";

cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });
cssInterop(Pressable, { className: "style" });

export type SnackbarVariant = "default" | "success" | "error" | "warning" | "info";
export type SnackbarPosition = "top" | "bottom";

export interface SnackbarProps extends Omit<ViewProps, "children"> {
  /** Whether the snackbar is visible */
  visible: boolean;
  /** The message to display */
  message: string;
  /** Variant determines the color and icon */
  variant?: SnackbarVariant;
  /** Position on screen */
  position?: SnackbarPosition;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Called when snackbar should close */
  onClose?: () => void;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Additional class names */
  className?: string;
}

const variantConfig = {
  default: {
    container: "bg-foreground dark:bg-card border-border",
    text: "text-background dark:text-foreground",
    icon: null,
    iconColor: "",
  },
  success: {
    container: "bg-green-600 dark:bg-green-900 border-green-500",
    text: "text-white dark:text-green-100",
    icon: CheckCircle,
    iconColor: "text-white dark:text-green-300",
  },
  error: {
    container: "bg-red-600 dark:bg-red-900 border-red-500",
    text: "text-white dark:text-red-100",
    icon: AlertCircle,
    iconColor: "text-white dark:text-red-300",
  },
  warning: {
    container: "bg-amber-500 dark:bg-amber-900 border-amber-400",
    text: "text-white dark:text-amber-100",
    icon: AlertTriangle,
    iconColor: "text-white dark:text-amber-300",
  },
  info: {
    container: "bg-blue-600 dark:bg-blue-900 border-blue-500",
    text: "text-white dark:text-blue-100",
    icon: InfoIcon,
    iconColor: "text-white dark:text-blue-300",
  },
};

const Snackbar = React.forwardRef<React.ComponentRef<typeof View>, SnackbarProps>(
  (
    {
      visible,
      message,
      variant = "default",
      position = "bottom",
      duration = 4000,
      actionText,
      onAction,
      onClose,
      showCloseButton = true,
      className,
      ...props
    },
    ref
  ) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(position === "bottom" ? 100 : -100)).current;
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      if (visible) {
        setIsVisible(true);
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();

        // Auto-dismiss
        if (duration > 0 && onClose) {
          const timer = setTimeout(() => {
            handleClose();
          }, duration);
          return () => clearTimeout(timer);
        }
      } else {
        // Reset animation values
        fadeAnim.setValue(0);
        translateY.setValue(position === "bottom" ? 100 : -100);
      }
    }, [visible, duration]);

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(translateY, {
          toValue: position === "bottom" ? 100 : -100,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        setIsVisible(false);
        onClose?.();
      });
    };

    const config = variantConfig[variant];
    const IconComponent = config.icon;

    if (!visible && !isVisible) return null;

    // For web, use CSS transitions instead of Animated
    if (Platform.OS === 'web') {
      return (
        <div
          className={cn(
            "fixed left-0 right-0 z-[99999] px-4 pointer-events-none transition-all duration-200",
            position === "bottom" ? "bottom-8" : "top-8",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{
            pointerEvents: visible ? 'auto' : 'none',
          }}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-md flex flex-row items-center gap-3 rounded-xl border px-4 py-3 shadow-lg pointer-events-auto",
              config.container,
              className
            )}
          >
            {/* Icon */}
            {IconComponent && (
              <Icon icon={IconComponent} className={cn("h-5 w-5 shrink-0", config.iconColor)} />
            )}

            {/* Message */}
            <span className={cn("flex-1 text-sm font-medium", config.text)}>
              {message}
            </span>

            {/* Action Button */}
            {actionText && onAction && (
              <button
                onClick={() => {
                  onAction();
                  handleClose();
                }}
                className={cn("rounded-md px-2 py-1 text-sm font-bold underline", config.text)}
              >
                {actionText}
              </button>
            )}

            {/* Close Button */}
            {showCloseButton && onClose && (
              <button
                onClick={handleClose}
                className="rounded-full p-1 hover:bg-white/10"
                aria-label="Close"
              >
                <Icon icon={X} className={cn("h-4 w-4", config.text)} />
              </button>
            )}
          </div>
        </div>
      );
    }

    // For native, use Animated.View
    return (
      <View
        ref={ref}
        className={cn(
          "absolute left-0 right-0 z-50 px-4",
          position === "bottom" ? "bottom-8" : "top-8"
        )}
        pointerEvents="box-none"
        {...props}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          <View
            className={cn(
              "mx-auto w-full max-w-md flex-row items-center gap-3 rounded-xl border px-4 py-3 shadow-lg",
              config.container,
              className
            )}
          >
            {/* Icon */}
            {IconComponent && (
              <Icon icon={IconComponent} className={cn("h-5 w-5 shrink-0", config.iconColor)} />
            )}

            {/* Message */}
            <Text className={cn("flex-1 text-sm font-medium", config.text)} numberOfLines={2}>
              {message}
            </Text>

            {/* Action Button */}
            {actionText && onAction && (
              <Pressable
                onPress={() => {
                  onAction();
                  handleClose();
                }}
                className="rounded-md px-2 py-1"
              >
                <Text className={cn("text-sm font-bold underline", config.text)}>
                  {actionText}
                </Text>
              </Pressable>
            )}

            {/* Close Button */}
            {showCloseButton && onClose && (
              <Pressable
                onPress={handleClose}
                className="rounded-full p-1 hover:bg-white/10"
                accessibilityLabel="Close"
              >
                <Icon icon={X} className={cn("h-4 w-4", config.text)} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }
);

Snackbar.displayName = "Snackbar";

// Hook for managing snackbar state
export interface SnackbarState {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
  actionText?: string;
  onAction?: () => void;
}

export function useSnackbar() {
  const [state, setState] = React.useState<SnackbarState>({
    visible: false,
    message: "",
    variant: "default",
  });

  const show = React.useCallback(
    (
      message: string,
      options?: {
        variant?: SnackbarVariant;
        actionText?: string;
        onAction?: () => void;
      }
    ) => {
      setState({
        visible: true,
        message,
        variant: options?.variant || "default",
        actionText: options?.actionText,
        onAction: options?.onAction,
      });
    },
    []
  );

  const hide = React.useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = React.useCallback(
    (message: string, options?: { actionText?: string; onAction?: () => void }) => {
      show(message, { ...options, variant: "success" });
    },
    [show]
  );

  const error = React.useCallback(
    (message: string, options?: { actionText?: string; onAction?: () => void }) => {
      show(message, { ...options, variant: "error" });
    },
    [show]
  );

  const warning = React.useCallback(
    (message: string, options?: { actionText?: string; onAction?: () => void }) => {
      show(message, { ...options, variant: "warning" });
    },
    [show]
  );

  const info = React.useCallback(
    (message: string, options?: { actionText?: string; onAction?: () => void }) => {
      show(message, { ...options, variant: "info" });
    },
    [show]
  );

  return {
    state,
    show,
    hide,
    success,
    error,
    warning,
    info,
  };
}

export { Snackbar };

