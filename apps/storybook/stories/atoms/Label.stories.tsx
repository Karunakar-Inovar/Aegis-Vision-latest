import type { Meta, StoryObj } from "@storybook/react";
import { Label, Input, View } from "ui";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
  },
  args: {
    children: "Label text",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Playground: Story = {};

export const WithInput: Story = {
  render: () => (
    <View className="gap-2">
      <Label>Password</Label>
      <Input placeholder="••••••••" secureTextEntry />
    </View>
  ),
};









