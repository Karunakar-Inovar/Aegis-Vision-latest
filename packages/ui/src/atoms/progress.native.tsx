import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../../utils/cn";

cssInterop(View, {
  className: "style",
});

export interface ProgressProps extends ViewProps {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<React.ComponentRef<typeof View>, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <View
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        accessibilityRole="progressbar"
        accessibilityValue={{ now: value, min: 0, max }}
        {...props}
      >
        <View className="h-full bg-primary" style={{ width: `${percentage}%` }} />
      </View>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };




