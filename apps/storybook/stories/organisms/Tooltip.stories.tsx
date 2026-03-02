import type { Meta, StoryObj } from "@storybook/react";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "ui";

const meta: Meta<typeof Tooltip> = {
  title: "Organisms/Tooltip",
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const IconTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">?</Button>
        </TooltipTrigger>
        <TooltipContent>Need access? Contact your workspace admin.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};














