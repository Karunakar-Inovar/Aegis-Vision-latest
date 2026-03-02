import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-90 dark:hover:brightness-110",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-90 dark:hover:brightness-110",
        outline: "border border-input bg-background text-foreground hover:bg-muted hover:text-accent-foreground hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-95 dark:hover:brightness-90",
        ghost: "text-foreground hover:bg-muted hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:brightness-75 dark:hover:brightness-125",
        /** Button variant for use on dark card backgrounds - visible in both light and dark modes */
        "dark-card": "bg-white/95 text-slate-900 border border-white/20 hover:bg-white dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
