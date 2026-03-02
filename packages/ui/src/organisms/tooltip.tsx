import * as React from "react";
import { cn } from "../../utils/cn";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "./dialog";

const TooltipProvider: React.FC<React.PropsWithChildren<{ delayDuration?: number }>> = ({ children }) => (
  <>{children}</>
);

const Tooltip = Dialog;
const TooltipTrigger = DialogTrigger;

const TooltipContent = React.forwardRef<any, { className?: string }>(({
  className,
  ...props
}, ref) => (
  <DialogContent
    ref={ref}
    showCloseButton={false}
    className={cn("max-w-xs rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground shadow-md", className)}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };









