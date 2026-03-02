import type { Meta, StoryObj } from "@storybook/react";
import { Switch, Label, View } from "ui";
import * as React from "react";

const meta: Meta<typeof Switch> = {
  title: "Atoms/Switch",
  component: Switch,
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
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  render: (args) => <Switch {...args} />,
};

export const LabeledToggle: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <View className="flex-row items-center gap-2">
        <Switch id="pipeline" checked={checked} onCheckedChange={setChecked} />
        <Label>Pipeline Active</Label>
      </View>
    );
  },
};









