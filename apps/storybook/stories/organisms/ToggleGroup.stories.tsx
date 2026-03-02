import type { Meta, StoryObj } from "@storybook/react";
import { ToggleGroup, ToggleGroupItem } from "ui";

const meta: Meta<typeof ToggleGroup> = {
  title: "Organisms/ToggleGroup",
  component: ToggleGroup,
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Filters: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["critical"]}>
      <ToggleGroupItem value="critical">Critical</ToggleGroupItem>
      <ToggleGroupItem value="warning">Warning</ToggleGroupItem>
      <ToggleGroupItem value="info">Info</ToggleGroupItem>
    </ToggleGroup>
  ),
};














