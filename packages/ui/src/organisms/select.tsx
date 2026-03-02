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
import { ChevronDown, Check } from "lucide-react";
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

interface SelectContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
  registerItem: (value: string, label: React.ReactNode) => void;
  labels: Record<string, React.ReactNode>;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = useControllableState<string | undefined>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});
  const containerRef = React.useRef<View>(null);

  const registerItem = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setLabels((prev) => {
      if (prev[itemValue] === label) return prev;
      return { ...prev, [itemValue]: label };
    });
  }, []);

  // Close on click outside (web only)
  React.useEffect(() => {
    if (Platform.OS !== "web" || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef.current as unknown as HTMLElement;
      if (container && !container.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      value: selectedValue,
      setValue: setSelectedValue,
      registerItem,
      labels,
      disabled,
    }),
    [isOpen, setIsOpen, selectedValue, setSelectedValue, registerItem, labels, disabled]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {/* High z-index on open to ensure dropdown renders above surrounding layout on web */}
      <View ref={containerRef} className="relative" style={{ zIndex: isOpen ? 10000 : 1 }}>
        {children}
      </View>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends PressableProps {
  size?: "sm" | "default";
  className?: string;
}

const SelectTrigger = React.forwardRef<any, SelectTriggerProps>(
  ({ className, size = "default", children, disabled: disabledProp, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);
    
    if (!ctx) {
      throw new Error("SelectTrigger must be used within a Select");
    }

    // Use disabled from context or prop (prop takes precedence for flexibility)
    const disabled = disabledProp ?? ctx.disabled ?? false;

    const handlePress = () => {
      if (disabled) {
        return;
      }
      ctx.setOpen(!ctx.open);
    };

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
          disabled && "opacity-50",
          className
        )}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Pressable>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectContentProps extends ViewProps {
  scrollEnabled?: boolean;
}

const SelectContent: React.FC<SelectContentProps> = ({ className, children, scrollEnabled = true, ...props }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("SelectContent must be used within a Select");
  }

  // Render children in hidden div to register labels even when closed
  React.useLayoutEffect(() => {
    // This effect ensures children are processed for label registration
  }, [children]);

  if (!ctx.open) {
    // Render children hidden to register labels
    return (
      <View style={{ display: 'none' }}>
        {children}
      </View>
    );
  }

  // On web, render as absolute positioned dropdown with scrolling
  if (Platform.OS === "web") {
    return (
      <View
        className={cn(
          "absolute left-0 right-0 top-full mt-1 max-h-60 overflow-hidden rounded-md border border-border bg-popover shadow-lg",
          className
        )}
        style={{ zIndex: 10001 }}
        {...props}
      >
        <ScrollView 
          className="max-h-60 p-1" 
          showsVerticalScrollIndicator={true}
          style={{ maxHeight: 240 }}
      >
        {children}
        </ScrollView>
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

const SelectGroup: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("py-1", className)} {...props} />
);

const SelectLabel: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <Text className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}>{children}</Text>
);

const SelectSeparator: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("my-1 h-px bg-muted", className)} {...props} />
);

interface SelectItemProps extends PressableProps {
  value: string;
  disabled?: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({ className, value, disabled, children, ...props }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("SelectItem must be used within a Select");
  }

  // Register immediately on mount and when value/children change
  // Register items as early as possible so SelectValue can immediately resolve labels.
  // useLayoutEffect helps avoid a race where a user selects before labels are registered.
  React.useLayoutEffect(() => {
    ctx.registerItem(value, children);
  }, [ctx, value, children]);

  const isSelected = ctx.value === value;

  const handlePress = () => {
    if (disabled) return;
    // Ensure label is registered before closing, so the trigger updates reliably.
    ctx.registerItem(value, children);
    ctx.setValue(value);
    ctx.setOpen(false);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      className={cn(
        "relative flex w-full cursor-pointer flex-row items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted focus:bg-muted",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      {isSelected && (
        <View className="absolute left-2 h-4 w-4 items-center justify-center">
          <Check className="h-4 w-4 text-current" />
        </View>
      )}
      <Text className="text-foreground">{children}</Text>
    </Pressable>
  );
};

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("SelectValue must be used within a Select");
  }

  // Use the registered label if available, otherwise fall back to the raw value
  const content = ctx.value ? (ctx.labels[ctx.value] || ctx.value) : null;

  return (
    <View className="flex-1">
      <Text className={cn(content ? "text-foreground" : "text-muted-foreground", className)}>
        {content ?? placeholder ?? "Select"}
      </Text>
    </View>
  );
};

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
};
