import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "ui";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const meta: Meta<typeof ChartContainer> = {
  title: "Organisms/Chart",
  component: ChartContainer,
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const data = [
  { label: "Mon", critical: 4, warning: 12 },
  { label: "Tue", critical: 6, warning: 9 },
  { label: "Wed", critical: 3, warning: 14 },
  { label: "Thu", critical: 5, warning: 11 },
  { label: "Fri", critical: 7, warning: 8 },
];

export const AlertsTrend: Story = {
  render: () => (
    <ChartContainer
      config={{
        critical: { label: "Critical", color: "hsl(var(--destructive))" },
        warning: { label: "Warning", color: "hsl(var(--primary))" },
      }}
      className="h-64 w-full max-w-xl rounded-lg border border-border p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" strokeWidth={2} />
          <Line type="monotone" dataKey="warning" stroke="hsl(var(--primary))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  ),
};














