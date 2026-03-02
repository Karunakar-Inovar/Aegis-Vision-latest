import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "ui";

const meta: Meta<typeof Textarea> = {
  title: "Organisms/Textarea",
  component: Textarea,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Notes: Story = {
  args: {
    placeholder: "Add investigation notes…",
    rows: 4,
  },
};














