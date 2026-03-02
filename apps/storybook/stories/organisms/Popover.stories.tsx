import type { Meta, StoryObj } from "@storybook/react";
import { Button, Popover, PopoverContent, PopoverTrigger, Text } from "ui";

const meta: Meta<typeof Popover> = {
  title: "Organisms/Popover",
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const FilterPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filters</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Text className="text-sm font-medium">Alert types</Text>
        <Text className="text-xs text-muted-foreground">
          Select which alerts surface in the dashboard.
        </Text>
      </PopoverContent>
    </Popover>
  ),
};









