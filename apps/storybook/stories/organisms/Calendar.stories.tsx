import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "ui";

const meta: Meta<typeof Calendar> = {
  title: "Organisms/Calendar",
  component: Calendar,
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const DatePicker: Story = {
  render: () => <Calendar mode="single" />,
};














