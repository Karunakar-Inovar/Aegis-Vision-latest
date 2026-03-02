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

export interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const EmptyState = React.forwardRef<React.ComponentRef<typeof View>, EmptyStateProps>(
  ({ className, icon, title, description, actions, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10",
        className
      )}
      {...props}
    >
      {icon ? <View className="text-muted-foreground">{icon}</View> : null}
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
        {description ? (
          <Text className="text-sm text-muted-foreground max-w-md text-center">{description}</Text>
        ) : null}
      </View>
      {actions ? <View className="flex flex-row flex-wrap items-center justify-center gap-3">{actions}</View> : null}
    </View>
  )
);
EmptyState.displayName = "EmptyState";

export { EmptyState };









