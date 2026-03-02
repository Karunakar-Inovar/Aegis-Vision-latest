import type { Meta, StoryObj } from "@storybook/react";
import { Kbd, View, Text } from "ui";

const meta: Meta<typeof Kbd> = {
  title: "Atoms/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
  },
  args: {
    children: "⌘K",
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const ShortcutLegend: Story = {
  render: () => (
    <View className="flex-row flex-wrap gap-3">
      {[
        { combo: ["⌘", "K"], label: "Command Palette" },
        { combo: ["?"], label: "Help" },
        { combo: ["Shift", "N"], label: "New Alert" },
      ].map(({ combo, label }) => (
        <View key={label} className="flex-row items-center gap-2">
          {combo.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
          <Text className="text-sm text-muted-foreground">{label}</Text>
        </View>
      ))}
    </View>
  ),
};









