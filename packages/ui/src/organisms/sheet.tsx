import * as React from "react";
import { Modal, View, Text, Pressable, type ViewProps, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ open, defaultOpen = false, onOpenChange, children }) => {
  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (isControlled) {
      setInternalOpen(open as boolean);
    }
  }, [isControlled, open]);

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open: isControlled ? (open as boolean) : internalOpen, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

interface TriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

const SheetTrigger: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(true);
    },
  });
};

const SheetClose: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(false);
    },
  });
};

export interface SheetContentProps extends ViewProps {
  side?: "top" | "bottom" | "left" | "right";
}

const SheetContent: React.FC<SheetContentProps> = ({ className, children, side = "right", ...props }) => {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;

  const handleClose = () => ctx.setOpen(false);

  const sideClasses =
    side === "right"
      ? "top-0 right-0 h-full w-5/6 max-w-md"
      : side === "left"
      ? "top-0 left-0 h-full w-5/6 max-w-md"
      : side === "top"
      ? "top-0 h-5/6 w-full max-h-screen"
      : "bottom-0 h-5/6 w-full max-h-screen";

  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={handleClose}>
        <Pressable
          className={cn(
            "absolute z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition-transform duration-300",
            sideClasses,
            ctx.open
              ? "translate-x-0 translate-y-0"
              : side === "right"
              ? "translate-x-full"
              : side === "left"
              ? "-translate-x-full"
              : side === "top"
              ? "-translate-y-full"
              : "translate-y-full",
            className
          )}
          onPress={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const SheetHeader: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("flex flex-col space-y-1.5", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={cn("mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle: React.FC<TextProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-lg font-semibold text-foreground", className)} {...props}>
    {children}
  </Text>
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription: React.FC<TextProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </Text>
);
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};









