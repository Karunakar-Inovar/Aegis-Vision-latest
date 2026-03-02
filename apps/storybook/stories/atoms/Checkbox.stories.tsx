import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Label, View } from "ui";
import * as React from "react";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
  args: {
    disabled: false,
    checked: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  render: (args) => <Checkbox {...args} />,
};

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <View className="flex-row items-center gap-2">
        <Checkbox id="alerts" checked={checked} onCheckedChange={(value) => setChecked(Boolean(value))} />
        <Label>Email notifications</Label>
      </View>
    );
  },
};









