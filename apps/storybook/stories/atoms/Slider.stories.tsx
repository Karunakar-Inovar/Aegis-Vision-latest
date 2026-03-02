import type { Meta, StoryObj } from "@storybook/react";
import { Slider, View, Text } from "ui";
import * as React from "react";

const meta: Meta<typeof Slider> = {
  title: "Atoms/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    defaultValue: [50],
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  render: (args) => <Slider {...args} />,
};

export const ConfidenceExample: Story = {
  render: () => {
    const [value, setValue] = React.useState(65);
    return (
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">Confidence Threshold</Text>
          <Text className="text-sm text-muted-foreground">{value}%</Text>
        </View>
        <Slider value={value} onValueChange={setValue} min={0} max={100} step={1} />
      </View>
    );
  },
};









