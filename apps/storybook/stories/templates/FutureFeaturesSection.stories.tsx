import type { Meta, StoryObj } from "@storybook/react";
import { FutureFeaturesSection } from "ui";

const meta: Meta<typeof FutureFeaturesSection> = {
  title: "Templates/FutureFeaturesSection",
  component: FutureFeaturesSection,
};

export default meta;
type Story = StoryObj<typeof FutureFeaturesSection>;

export const Default: Story = {
  args: {
    title: "Upcoming capabilities",
    description: "Preview the roadmap and subscribe for updates.",
  },
};














