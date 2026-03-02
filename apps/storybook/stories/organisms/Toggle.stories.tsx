import type { Meta, StoryObj } from "@storybook/react";
import { Toggle, View } from "ui";
import { LayoutGrid, Rows3 } from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "Organisms/Toggle",
  component: Toggle,
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const ViewToggle: Story = {
  render: () => (
    <View className="flex-row gap-2">
      <Toggle aria-label="Grid view" size="sm">
        <LayoutGrid className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="List view" size="sm">
        <Rows3 className="h-4 w-4" />
      </Toggle>
    </View>
  ),
};









