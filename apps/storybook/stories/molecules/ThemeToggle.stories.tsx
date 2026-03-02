import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle, ThemeProvider, View, Text } from "ui";

const meta: Meta<typeof ThemeToggle> = {
  title: "Molecules/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <View className="items-center justify-center p-8">
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};

export const InCard: Story = {
  render: () => (
    <View className="rounded-lg border bg-card p-8 text-card-foreground">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="text-lg font-semibold">Theme Settings</Text>
          <Text className="text-sm text-muted-foreground">Switch between light and dark mode</Text>
        </View>
        <ThemeToggle />
      </View>
    </View>
  ),
};









