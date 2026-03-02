import * as React from "react";
import { View, type ViewProps, Text } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

cssInterop(Text, {
  className: "style",
});

export interface CardProps extends ViewProps {}

const Card = React.forwardRef<React.ComponentRef<typeof View>, CardProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "rounded-lg bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export interface CardHeaderProps extends ViewProps {}

const CardHeader = React.forwardRef<React.ComponentRef<typeof View>, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex flex-col gap-1.5 border-b border-border p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends ViewProps {}

const CardTitle = React.forwardRef<React.ComponentRef<typeof Text>, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends ViewProps {}

const CardDescription = React.forwardRef<React.ComponentRef<typeof Text>, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  )
);
CardDescription.displayName = "CardDescription";

export interface CardActionProps extends ViewProps {}

const CardAction = React.forwardRef<React.ComponentRef<typeof View>, CardActionProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("ml-auto flex flex-row items-center gap-2", className)} {...props} />
  )
);
CardAction.displayName = "CardAction";

export interface CardContentProps extends ViewProps {}

const CardContent = React.forwardRef<React.ComponentRef<typeof View>, CardContentProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends ViewProps {}

const CardFooter = React.forwardRef<React.ComponentRef<typeof View>, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex flex-row items-center gap-2 border-t border-border p-6", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};





