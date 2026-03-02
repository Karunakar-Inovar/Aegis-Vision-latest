import * as React from "react";
import { View, Pressable, type ViewProps, type PressableProps } from "react-native";
import { ChevronDown } from "lucide-react";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { useControllableState } from "../utils/use-controllable-state";

cssInterop(View, {
  className: "style",
});

cssInterop(Pressable, {
  className: "style",
});

type AccordionValue = string | string[] | undefined;

interface AccordionContextValue {
  type: "single" | "multiple";
  value?: string | string[];
  setValue: (value: string, open: boolean) => void;
  isItemOpen: (value: string) => boolean;
  collapsible: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = false,
  children,
}) => {
  const [currentValue, setCurrentValue] = useControllableState<AccordionValue>({
    value,
    defaultValue:
      typeof defaultValue !== "undefined"
        ? defaultValue
        : type === "single"
        ? ""
        : [],
    onChange: onValueChange as (next: AccordionValue) => void,
  });

  const ctx = React.useMemo<AccordionContextValue>(() => {
    const normalizedValue =
      type === "single"
        ? (currentValue as string | undefined)
        : Array.isArray(currentValue)
        ? currentValue
        : [];

    const isItemOpen = (itemValue: string) => {
      if (type === "single") {
        return normalizedValue === itemValue;
      }
      return normalizedValue.includes(itemValue);
    };

    const setValue = (itemValue: string, open: boolean) => {
      if (type === "single") {
        if (open) {
          setCurrentValue(itemValue);
        } else if (collapsible) {
          setCurrentValue("");
        }
      } else {
        const values = normalizedValue as string[];
        const nextValues = open
          ? Array.from(new Set([...values, itemValue]))
          : values.filter((v) => v !== itemValue);
        setCurrentValue(nextValues);
      }
    };

    return {
      type,
      value: normalizedValue,
      setValue,
      isItemOpen,
      collapsible,
    };
  }, [type, currentValue, setCurrentValue, collapsible]);

  return <AccordionContext.Provider value={ctx}>{children}</AccordionContext.Provider>;
};

interface AccordionItemProps extends ViewProps {
  value: string;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<View, AccordionItemProps>(
  ({ className, value, disabled = false, children, ...props }, ref) => (
    <View
      ref={ref}
      data-value={value}
      aria-disabled={disabled}
      className={cn("border-b border-border", className)}
      {...props}
    >
      {children}
    </View>
  )
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps extends PressableProps {
  value: string;
}

const AccordionTrigger = React.forwardRef<Pressable, AccordionTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext);
    if (!ctx) {
      throw new Error("AccordionTrigger must be used within an Accordion");
    }

    const isOpen = ctx.isItemOpen(value);

    const handlePress = () => {
      ctx.setValue(value, !isOpen);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className={cn(
          "flex flex-1 flex-row items-center justify-between py-4 text-sm font-medium transition",
          className
        )}
        onPress={handlePress}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Pressable>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends ViewProps {
  value: string;
}

const AccordionContent = React.forwardRef<View, AccordionContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext);
    if (!ctx) {
      throw new Error("AccordionContent must be used within an Accordion");
    }

    if (!ctx.isItemOpen(value)) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn("pb-4 pt-0 text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };









