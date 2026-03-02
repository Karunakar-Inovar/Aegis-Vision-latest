import * as React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  type ViewProps,
  type TextProps,
} from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

type ClassNameViewProps = ViewProps & { className?: string };
type ClassNameTextProps = TextProps & { className?: string };

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
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
    <DialogContext.Provider value={{ open: isControlled ? (open as boolean) : internalOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

interface TriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

const DialogTrigger: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(true);
    },
  });
};

const DialogPortal: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

const DialogOverlay: React.FC<ClassNameViewProps> = ({ className, ...props }) => (
  <View className={cn("flex-1 bg-black/40", className)} {...props} />
);

export interface DialogContentProps extends ViewProps {
  showCloseButton?: boolean;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
  showCloseButton = true,
  ...props
}) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;

  const handleClose = () => ctx.setOpen(false);

  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <DialogOverlay>
        <View
          className={cn(
            "mx-auto my-auto w-11/12 max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <Pressable
              className="absolute right-4 top-4 rounded-full bg-transparent p-2"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <View className="h-4 w-4 items-center justify-center">
                <View className="absolute h-4 w-0.5 rotate-45 bg-foreground" />
                <View className="absolute h-4 w-0.5 -rotate-45 bg-foreground" />
              </View>
            </Pressable>
          ) : null}
        </View>
      </DialogOverlay>
    </Modal>
  );
};

const DialogHeader: React.FC<ClassNameViewProps> = ({ className, ...props }) => (
  <View className={cn("flex flex-col space-y-1.5", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter: React.FC<ClassNameViewProps> = ({ className, ...props }) => (
  <View className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle: React.FC<ClassNameTextProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </Text>
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription: React.FC<ClassNameTextProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </Text>
);
DialogDescription.displayName = "DialogDescription";

const DialogClose: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(false);
    },
  });
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};









