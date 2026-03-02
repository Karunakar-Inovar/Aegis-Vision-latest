import type { Meta, StoryObj } from "@storybook/react";
import { Separator, View, Text } from "ui";

const meta: Meta<typeof Separator> = {
  title: "Atoms/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      control: "boolean",
    },
  },
  args: {
    orientation: "horizontal",
    decorative: true,
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Playground: Story = {};

export const Examples: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-sm font-medium text-muted-foreground">Horizontal</Text>
        <Separator />
      </View>
      <View className="h-16 flex-row items-center gap-6">
        <Text>Camera</Text>
        <Separator orientation="vertical" className="h-full" />
        <Text>Status</Text>
        <Separator orientation="vertical" className="h-full" />
        <Text>Actions</Text>
      </View>
    </View>
  ),
};









