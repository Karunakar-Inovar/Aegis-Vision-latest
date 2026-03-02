import type { Meta, StoryObj } from "@storybook/react";
import { Progress, View, Text } from "ui";
import * as React from "react";

const meta: Meta<typeof Progress> = {
  title: "Atoms/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
  args: {
    value: 50,
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Playground: Story = {};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = React.useState(25);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setValue((prev) => (prev >= 100 ? 0 : prev + 5));
      }, 700);
      return () => clearInterval(timer);
    }, []);

    return (
      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">Setup progress {value}%</Text>
        <Progress value={value} />
      </View>
    );
  },
};









