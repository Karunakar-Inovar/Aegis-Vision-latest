import * as React from "react";
import { Modal, View, Text, type ViewProps, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
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
    <AlertDialogContext.Provider value={{ open: isControlled ? (open as boolean) : internalOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

type TriggerProps = {
  children: React.ReactElement<{ onPress?: (...args: any[]) => void }>;
  asChild?: boolean;
};

const AlertDialogTrigger: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children as React.ReactElement<{ onPress?: (...args: any[]) => void }>;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(true);
    },
  });
};

interface AlertDialogOverlayProps extends ViewProps {
  className?: string;
}

const AlertDialogOverlay: React.FC<AlertDialogOverlayProps> = ({ className, ...props }) => (
  <View className={cn("flex-1 bg-black/40", className)} {...props} />
);

export interface AlertDialogContentProps extends ViewProps {
  className?: string;
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ className, children, ...props }) => {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) return null;

  const handleClose = () => ctx.setOpen(false);

  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <AlertDialogOverlay>
        <View
          className={cn(
            "mx-auto my-auto w-11/12 max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg",
            className
          )}
          {...props}
        >
          {children}
        </View>
      </AlertDialogOverlay>
    </Modal>
  );
};

interface AlertDialogHeaderProps extends ViewProps {
  className?: string;
}

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ className, ...props }) => (
  <View className={cn("flex flex-col space-y-1.5", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

interface AlertDialogFooterProps extends ViewProps {
  className?: string;
}

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ className, ...props }) => (
  <View className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

interface AlertDialogTitleProps extends TextProps {
  className?: string;
}

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </Text>
);
AlertDialogTitle.displayName = "AlertDialogTitle";

interface AlertDialogDescriptionProps extends TextProps {
  className?: string;
}

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ className, children, ...props }) => (
  <Text className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </Text>
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children as React.ReactElement<{ onPress?: (...args: any[]) => void }>;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(false);
    },
  });
};

const AlertDialogCancel: React.FC<TriggerProps> = ({ children, asChild = false }) => {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) return children;
  const child = asChild ? React.Children.only(children) : children as React.ReactElement<{ onPress?: (...args: any[]) => void }>;

  return React.cloneElement(child, {
    onPress: (...args: any[]) => {
      child.props?.onPress?.(...args);
      ctx.setOpen(false);
    },
  });
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};









