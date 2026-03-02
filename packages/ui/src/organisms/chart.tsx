import * as React from "react";
import { cn } from "../../utils/cn";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartConfig>({});

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => (
    <ChartContext.Provider value={config}>
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
);
ChartContainer.displayName = "ChartContainer";

const useChartConfig = () => React.useContext(ChartContext);

const ChartLegend = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-wrap gap-3 text-sm text-muted-foreground", className)} {...props} />
);
ChartLegend.displayName = "ChartLegend";

interface ChartLegendContentProps {
  payload?: {
    value: string;
    color: string;
    dataKey: string;
  }[];
}

const ChartLegendContent = ({ payload }: ChartLegendContentProps) => {
  const config = useChartConfig();
  if (!payload) return null;
  return (
    <>
      {payload.map((item) => {
        const entry = config[item.dataKey] ?? { label: item.value, color: item.color };
        return (
          <div key={item.value} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? item.color }} />
            <span>{entry.label}</span>
          </div>
        );
      })}
    </>
  );
};

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  payload?: { value: number; name: string; dataKey: string }[];
  label?: string;
}

const ChartTooltip = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-md border bg-popover px-3 py-2 text-sm shadow-md text-popover-foreground",
      className
    )}
    {...props}
  />
);
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = ({ active, payload, label }: ChartTooltipContentProps) => {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-medium text-muted-foreground">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => {
          const entry = config[item.dataKey] ?? { label: item.name };
          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{entry.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};














