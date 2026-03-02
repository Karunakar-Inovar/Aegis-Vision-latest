import type { Meta, StoryObj } from "@storybook/react";
import { Badge, View } from "ui";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "default",
    children: "Badge",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const StatusExamples: Story = {
  render: () => (
    <View className="flex-row flex-wrap gap-3">
      <Badge>Online</Badge>
      <Badge variant="secondary">Offline</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Beta</Badge>
    </View>
  ),
};









