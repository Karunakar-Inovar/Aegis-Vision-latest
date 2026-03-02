import type { Meta, StoryObj } from "@storybook/react";
import { Input, View, Text } from "ui";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
    "aria-invalid": {
      control: "boolean",
    },
  },
  args: {
    type: "text",
    placeholder: "Enter text...",
    disabled: false,
    "aria-invalid": false,
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <View className="gap-2">
      <Text className="text-sm font-medium">Email</Text>
      <Input {...args} placeholder="you@example.com" type="email" />
    </View>
  ),
};









