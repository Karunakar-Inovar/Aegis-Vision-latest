import * as React from "react";
import { View, Text, ScrollView, type ViewProps, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../utils/cn";

cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });
cssInterop(ScrollView, { className: "style" });

// Table Container
export interface TableProps extends ViewProps {
  className?: string;
}

const Table = React.forwardRef<React.ComponentRef<typeof View>, TableProps>(
  ({ className, children, ...props }, ref) => (
    <View ref={ref} className={cn("w-full", className)} {...props}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="w-full min-w-full">{children}</View>
      </ScrollView>
    </View>
  )
);
Table.displayName = "Table";

// Table Header
export interface TableHeaderProps extends ViewProps {
  className?: string;
}

const TableHeader = React.forwardRef<React.ComponentRef<typeof View>, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("border-b border-border bg-muted/50", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

// Table Body
export interface TableBodyProps extends ViewProps {
  className?: string;
}

const TableBody = React.forwardRef<React.ComponentRef<typeof View>, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

// Table Row
export interface TableRowProps extends ViewProps {
  className?: string;
}

const TableRow = React.forwardRef<React.ComponentRef<typeof View>, TableRowProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex-row items-center border-b border-border transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// Table Head Cell
export interface TableHeadProps extends ViewProps {
  className?: string;
}

const TableHead = React.forwardRef<React.ComponentRef<typeof View>, TableHeadProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("h-12 px-4 items-start justify-center", className)}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
);
TableHead.displayName = "TableHead";

// Table Cell
export interface TableCellProps extends ViewProps {
  className?: string;
}

const TableCell = React.forwardRef<React.ComponentRef<typeof View>, TableCellProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("px-4 py-3 items-start justify-center", className)}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
);
TableCell.displayName = "TableCell";

// Table Caption
export interface TableCaptionProps extends TextProps {
  className?: string;
}

const TableCaption = React.forwardRef<React.ComponentRef<typeof Text>, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground text-center", className)}
      {...props}
    />
  )
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
