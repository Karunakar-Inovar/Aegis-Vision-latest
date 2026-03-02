import * as React from "react";
import { ViewProps } from "react-native";
import { cn } from "../../utils/cn";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "./dialog";

const Popover = Dialog;
const PopoverTrigger = DialogTrigger;
const PopoverAnchor: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

const PopoverContent = React.forwardRef<any, ViewProps>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    showCloseButton={false}
    className={cn("w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md", className)}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };









