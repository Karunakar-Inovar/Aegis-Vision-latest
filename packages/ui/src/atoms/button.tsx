import * as React from "react";
import { Pressable, type PressableProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

cssInterop(Pressable, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

const textSizeClasses: Record<
  NonNullable<ButtonVariantProps["size"]>,
  string
> = {
  default: "text-sm",
  sm: "text-xs",
  lg: "text-base",
  icon: "text-base",
  "icon-sm": "text-sm",
  "icon-lg": "text-lg",
};

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    ButtonVariantProps {
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
  onClick?: (e?: any) => void;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, textClassName, onClick, onPress, type, ...props }, ref) => {
    const buttonRef = React.useRef<any>(null);
    const combinedRef = React.useCallback(
      (node: any) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Handle both onClick and onPress for web compatibility
    const handlePress = (e?: any) => {
      // If type is "submit", trigger form submission on web
      if (type === "submit" && typeof window !== "undefined") {
        // Try to find the form element from the event or ref
        let formElement: HTMLFormElement | null = null;
        
        // First try to get from event target (works on web)
        if (e?.target) {
          let element: any = e.target;
          while (element && element !== document.body) {
            if (element.tagName === "FORM") {
              formElement = element;
              break;
            }
            element = element.parentElement;
          }
        }
        
        // Fallback: try to find from ref
        if (!formElement && buttonRef.current) {
          let element: any = buttonRef.current;
          // React Native Web might wrap the element, try to get the actual DOM node
          if (element._nativeNode) {
            element = element._nativeNode;
          }
          while (element && element !== document.body) {
            if (element.tagName === "FORM") {
              formElement = element;
              break;
            }
            element = element.parentElement;
          }
        }
        
        if (formElement && formElement instanceof HTMLFormElement) {
          // Trigger form submission
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          formElement.dispatchEvent(submitEvent);
          // Also call the native submit if the event wasn't prevented
          if (!submitEvent.defaultPrevented) {
            formElement.requestSubmit();
          }
          return;
        }
      }

      if (onClick) {
        onClick(e);
      }
      if (onPress) {
        onPress(e);
      }
    };
    const resolvedSize = size ?? "default";
    const resolvedVariant = variant ?? "default";
    
    // Determine text color class based on variant
    const textColorClass = 
      resolvedVariant === "default" ? "text-primary-foreground" :
      resolvedVariant === "destructive" ? "text-destructive-foreground" :
      resolvedVariant === "secondary" ? "text-secondary-foreground" :
      resolvedVariant === "dark-card" ? "text-slate-900" :
      resolvedVariant === "link" ? "text-primary" :
      "text-foreground"; // outline, ghost use foreground color for dark mode compatibility
    
    const defaultTextClasses = cn(
      textSizeClasses[resolvedSize],
      textColorClass,
      textClassName
    );

    // Helper to recursively add text color to Text components
    const addTextColor = (child: React.ReactNode): React.ReactNode => {
      if (typeof child === "string" || typeof child === "number") {
        return (
          <Text className={defaultTextClasses}>
            {child}
          </Text>
        );
      }
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
        if (element.type === Text) {
          return React.cloneElement(element, {
            className: cn(
              textColorClass,
              element.props.className
            ),
          } as any);
        }
        // Recursively process children
        if (element.props.children) {
          return React.cloneElement(element, {
            children: React.Children.map(element.props.children, addTextColor),
          } as any);
        }
      }
      return child;
    };
    
    const content =
      React.Children.count(children) > 0
        ? React.Children.map(children, addTextColor)
        : null;

    return (
      <Pressable
        ref={combinedRef}
        accessibilityRole="button"
        className={cn(buttonVariants({ variant, size }), className)}
        onPress={onClick || onPress || type === "submit" ? handlePress : undefined}
        {...props}
      >
        {content}
      </Pressable>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };


