import type { Meta, StoryObj } from "@storybook/react";
import { Spinner, Button, View, Text } from "ui";

const meta: Meta<typeof Spinner> = {
  title: "Atoms/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
  args: {
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const WithinButton: Story = {
  render: () => (
    <View className="flex-col gap-4">
      <Button disabled className="flex-row items-center gap-2">
        <Spinner size="sm" />
        <Text>Processing</Text>
      </Button>
      <View className="flex-row items-center gap-4">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
      </View>
    </View>
  ),
};









