import * as React from "react";
import { View, Pressable, Text, type ViewProps, type PressableProps } from "react-native";
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

type TabsValue = string | undefined;
type TabsVariant = "default" | "underline";

interface TabsContextValue {
  value?: string;
  setValue: (value: string) => void;
  orientation: "horizontal" | "vertical";
  activateOnFocus: boolean;
  variant: TabsVariant;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

type ClassNameViewProps = ViewProps & { className?: string };
type ClassNamePressableProps = PressableProps & { className?: string };

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  activateOnFocus?: boolean;
  /** 
   * Visual style variant
   * - "default": Pill-style tabs with background
   * - "underline": Clean underline indicator style
   */
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activateOnFocus = false,
  variant = "default",
  className,
  children,
}) => {
  const [currentValue, setCurrentValue] = useControllableState<TabsValue>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      value: currentValue,
      setValue: (next) => setCurrentValue(next),
      orientation,
      activateOnFocus,
      variant,
    }),
    [currentValue, setCurrentValue, orientation, activateOnFocus, variant]
  );

  return (
    <TabsContext.Provider value={ctx}>
      {className ? <View className={className}>{children}</View> : children}
    </TabsContext.Provider>
  );
};

interface TabsListProps extends ClassNameViewProps {
  orientation?: "horizontal" | "vertical";
}

const TabsList = React.forwardRef<React.ElementRef<typeof View>, TabsListProps>(({ className, orientation, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  const direction = orientation ?? ctx?.orientation ?? "horizontal";
  const variant = ctx?.variant ?? "default";

  return (
    <View
      ref={ref}
      className={cn(
        // Default (pill) variant
        variant === "default" && [
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          direction === "vertical" && "flex-col h-auto",
        ],
        // Underline variant
        variant === "underline" && [
          "flex flex-row border-b border-border",
          direction === "vertical" && "flex-col border-b-0 border-r",
        ],
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends ClassNamePressableProps {
  value: string;
  disabled?: boolean;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, TabsTriggerProps>(
  ({ className, value: triggerValue, disabled = false, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (!ctx) {
      throw new Error("TabsTrigger must be used within a Tabs component");
    }

    const isActive = ctx.value === triggerValue;
    const variant = ctx.variant;

    const handlePress = () => {
      if (disabled) return;
      ctx.setValue(triggerValue);
    };

    // Determine if children is a string or already a React element
    const renderChildren = () => {
      if (typeof children === "string" || typeof children === "number") {
        return (
          <Text
            className={cn(
              "text-sm font-medium",
              disabled && "opacity-50",
              variant === "default" && [
                isActive ? "text-foreground" : "text-muted-foreground",
              ],
              variant === "underline" && [
                isActive ? "text-foreground font-semibold" : "text-muted-foreground",
              ]
            )}
          >
            {children}
          </Text>
        );
      }
      return children;
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive, disabled }}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "opacity-50",
          // Default (pill) variant
          variant === "default" && [
            "rounded-sm px-3 py-1.5",
            isActive && "bg-background shadow",
          ],
          // Underline variant
          variant === "underline" && [
            "relative px-4 py-3 -mb-px",
            isActive && "border-b-2 border-foreground",
          ],
          className
        )}
        disabled={disabled}
        onPress={handlePress}
        onFocus={ctx.activateOnFocus ? handlePress : undefined}
        {...props}
      >
        {renderChildren()}
      </Pressable>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends ClassNameViewProps {
  value: string;
}

const TabsContent = React.forwardRef<React.ElementRef<typeof View>, TabsContentProps>(
  ({ className, value: contentValue, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (!ctx) {
      throw new Error("TabsContent must be used within a Tabs component");
    }

    if (ctx.value !== contentValue) {
      return null;
    }

    return (
      <View
        ref={ref}
        accessibilityRole="tablist"
        className={cn(
          "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };









