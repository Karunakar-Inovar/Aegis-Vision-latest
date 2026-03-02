import * as React from "react";
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  Text,
  Platform,
  type ViewProps,
  type PressableProps,
} from "react-native";
import { ChevronDown, Check, X } from "lucide-react";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { useControllableState } from "../utils/use-controllable-state";
import { Checkbox } from "../atoms/checkbox";

cssInterop(View, {
  className: "style",
});

cssInterop(Pressable, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

interface MultiSelectContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  value: string[];
  setValue: (value: string[]) => void;
  toggleValue: (value: string) => void;
  registerItem: (value: string, label: React.ReactNode) => void;
  labels: Record<string, React.ReactNode>;
  disabled?: boolean;
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(null);

export interface MultiSelectProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  disabled = false,
}) => {
  const [selectedValues, setSelectedValues] = useControllableState<string[]>({
    value: Array.isArray(value) ? value : [],
    defaultValue: Array.isArray(defaultValue) ? defaultValue : [],
    onChange: onValueChange,
  });

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});
  const containerRef = React.useRef<View>(null);
  const triggerRef = React.useRef<any>(null);

  const registerItem = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setLabels((prev) => {
      if (prev[itemValue] === label) return prev;
      return { ...prev, [itemValue]: label };
    });
  }, []);

  const toggleValue = React.useCallback((itemValue: string) => {
    setSelectedValues((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const newValues = safePrev.includes(itemValue)
        ? safePrev.filter((v) => v !== itemValue)
        : [...safePrev, itemValue];
      return newValues;
    });
  }, [setSelectedValues]);

  // Close on click outside (web only)
  React.useEffect(() => {
    if (Platform.OS !== "web" || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef.current as unknown as HTMLElement;
      const target = event.target as Node;
      if (container && target && !container.contains(target)) {
        // Check if click is on the trigger button (should not close)
        const triggerButton = container.querySelector('button[type="button"]');
        if (triggerButton && (triggerButton === target || triggerButton.contains(target))) {
          return;
        }
        setIsOpen(false);
      }
    };

    // Use a small delay to prevent immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen, setIsOpen]);

  const safeSetValue = React.useCallback((newValue: string[]) => {
    const safeValue = Array.isArray(newValue) ? newValue : [];
    setSelectedValues(safeValue);
  }, [setSelectedValues]);

  const contextValue = React.useMemo<MultiSelectContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      value: Array.isArray(selectedValues) ? selectedValues : [],
      setValue: safeSetValue,
      toggleValue,
      registerItem,
      labels,
      disabled,
    }),
    [isOpen, setIsOpen, selectedValues, safeSetValue, toggleValue, registerItem, labels, disabled]
  );

  return (
    <MultiSelectContext.Provider value={contextValue}>
      {/* High z-index on open to ensure dropdown renders above surrounding layout on web */}
      <View 
        ref={containerRef} 
        className="relative" 
        style={{ 
          zIndex: isOpen ? 99998 : 1,
          // Ensure dropdown can overflow container
          overflow: Platform.OS === "web" ? 'visible' : undefined,
        }}
      >
        {children}
      </View>
    </MultiSelectContext.Provider>
  );
};

interface MultiSelectTriggerProps extends PressableProps {
  size?: "sm" | "default";
  className?: string;
}

const MultiSelectTrigger = React.forwardRef<any, MultiSelectTriggerProps>(
  ({ className, size = "default", children, disabled: disabledProp, ...props }, ref) => {
    const ctx = React.useContext(MultiSelectContext);
    
    if (!ctx) {
      throw new Error("MultiSelectTrigger must be used within a MultiSelect");
    }

    // Use disabled from context or prop (prop takes precedence for flexibility)
    const disabled = disabledProp ?? ctx.disabled ?? false;

    const handleToggle = React.useCallback((e?: any) => {
      if (disabled) {
        return;
      }
      // Prevent event from bubbling to Sheet's close handler
      if (e) {
        e.preventDefault?.();
        e.stopPropagation?.();
      }
      // Use functional update to ensure we get the latest state
      ctx.setOpen((prev: boolean) => {
        const newState = !prev;
        return newState;
      });
    }, [disabled, ctx]);

    // For web, we need to ensure clicks work inside Modal/Sheet
    // React Native Web's Pressable might not work correctly inside Modal, so use native button
    if (Platform.OS === "web") {
      return (
        <View className="relative w-full">
          {/* @ts-ignore - Using native button for web compatibility */}
          <button
            type="button"
            ref={ref as any}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggle(e);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              ctx.open && "ring-2 ring-ring ring-offset-2",
              size === "sm" && "h-8 text-xs",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer",
              "pointer-events-auto",
              className
            )}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
            aria-expanded={ctx.open}
            aria-disabled={disabled}
          >
            <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {children}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </View>
      );
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ expanded: ctx.open, disabled }}
        className={cn(
          "flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          ctx.open && "ring-2 ring-ring ring-offset-2",
          size === "sm" && "h-8 text-xs",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
          className
        )}
        disabled={disabled}
        onPress={handleToggle}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Pressable>
    );
  }
);
MultiSelectTrigger.displayName = "MultiSelectTrigger";

interface MultiSelectContentProps extends ViewProps {
  scrollEnabled?: boolean;
}

const MultiSelectContent: React.FC<MultiSelectContentProps> = ({ className, children, scrollEnabled = true, ...props }) => {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) {
    throw new Error("MultiSelectContent must be used within a MultiSelect");
  }

  // On web, always render the container but conditionally show it
  // Use visibility instead of display to ensure React Native Web creates DOM nodes
  if (Platform.OS === "web") {
    return (
      <View
        className={cn(
          "absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-lg p-1",
          className
        )}
        style={{ 
          zIndex: 99999,
          position: 'absolute',
          maxHeight: 240,
          visibility: ctx.open ? 'visible' : 'hidden',
          opacity: ctx.open ? 1 : 0,
          pointerEvents: ctx.open ? 'auto' : 'none',
        }}
        // @ts-ignore - onClick to prevent Sheet from closing
        onClick={(e: any) => {
          e?.stopPropagation();
        }}
        // @ts-ignore - onMouseDown to prevent Sheet from closing
        onMouseDown={(e: any) => {
          e?.stopPropagation();
        }}
        {...props}
      >
        {children}
      </View>
    );
  }

  // For native, render children hidden when closed to register labels
  if (!ctx.open) {
    return (
      <View style={{ display: 'none' }}>
        {children}
      </View>
    );
  }

  // On native, use Modal for proper overlay
  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType="fade"
      onRequestClose={() => ctx.setOpen(false)}
    >
      <Pressable 
        className="flex-1 bg-black/40" 
        onPress={() => ctx.setOpen(false)}
        accessibilityRole="button"
      >
        <View className="flex-1 items-center justify-center px-6">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className={cn(
                "max-h-80 w-80 rounded-lg border border-border bg-popover p-1 shadow-xl",
                className
              )}
              {...props}
            >
              {scrollEnabled ? <ScrollView className="max-h-72">{children}</ScrollView> : children}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const MultiSelectGroup: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("py-1", className)} {...props} />
);

const MultiSelectLabel: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <Text className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}>{children}</Text>
);

const MultiSelectSeparator: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("my-1 h-px bg-muted", className)} {...props} />
);

interface MultiSelectItemProps extends PressableProps {
  value: string;
  disabled?: boolean;
}

const MultiSelectItem: React.FC<MultiSelectItemProps> = ({ className, value, disabled, children, ...props }) => {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) {
    throw new Error("MultiSelectItem must be used within a MultiSelect");
  }

  // Register immediately on mount and when value/children change
  React.useLayoutEffect(() => {
    ctx.registerItem(value, children);
  }, [ctx, value, children]);

  const isSelected = Array.isArray(ctx.value) && ctx.value.includes(value);

  const handleToggle = React.useCallback(() => {
    if (disabled) return;
    ctx.toggleValue(value);
  }, [disabled, ctx, value]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      className={cn(
        "relative flex w-full cursor-pointer flex-row items-center rounded-sm py-2 pl-2 pr-2 text-sm outline-none gap-2",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted focus:bg-muted",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onPress={handleToggle}
      disabled={disabled}
      {...props}
    >
      {/* Checkbox - on web use native element to ensure clicks work inside Modal */}
      {Platform.OS === "web" ? (
        // @ts-ignore - Native div wrapper handles clicks directly since Pressable doesn't work in Modal
        <div
          onClick={(e) => {
            // Stop event from bubbling to parent Pressable
            e.stopPropagation();
            e.preventDefault();
            // Handle toggle directly here since Checkbox's Pressable may not work in Modal
            if (!disabled) {
              ctx.toggleValue(value);
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <Checkbox 
            checked={isSelected} 
            disabled={disabled}
            onCheckedChange={(checked) => {
              // This is a fallback, but the div's onClick should handle it
              if (!disabled) {
                ctx.toggleValue(value);
              }
            }}
          />
        </div>
      ) : (
        <View
          onStartShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <Checkbox 
            checked={isSelected} 
            disabled={disabled}
            onCheckedChange={(checked) => {
              // Toggle selection when checkbox is clicked
              if (!disabled) {
                ctx.toggleValue(value);
              }
            }}
          />
        </View>
      )}
      <Text className="text-foreground flex-1">{children}</Text>
    </Pressable>
  );
};

interface MultiSelectValueProps {
  placeholder?: string;
  className?: string;
  maxDisplay?: number;
}

const MultiSelectValue: React.FC<MultiSelectValueProps> = ({ placeholder, className, maxDisplay = 2 }) => {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) {
    throw new Error("MultiSelectValue must be used within a MultiSelect");
  }

  if (ctx.value.length === 0) {
    return (
      <View className="flex-1">
        <Text className={cn("text-muted-foreground", className)}>
          {placeholder ?? "Select items"}
        </Text>
      </View>
    );
  }

  const displayedLabels = ctx.value
    .slice(0, maxDisplay)
    .map((val) => ctx.labels[val] || val)
    .join(", ");

  const remainingCount = ctx.value.length - maxDisplay;

  return (
    <View className="flex-1 flex-row items-center gap-1 flex-wrap">
      <Text className={cn("text-foreground", className)}>
        {displayedLabels}
        {remainingCount > 0 && ` +${remainingCount} more`}
      </Text>
    </View>
  );
};

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectSeparator,
  MultiSelectGroup,
  MultiSelectLabel,
};
