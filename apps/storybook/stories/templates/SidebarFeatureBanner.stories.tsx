import type { Meta, StoryObj } from "@storybook/react";
import { SidebarFeatureBanner } from "ui";

const meta: Meta<typeof SidebarFeatureBanner> = {
  title: "Templates/SidebarFeatureBanner",
  component: SidebarFeatureBanner,
};

export default meta;
type Story = StoryObj<typeof SidebarFeatureBanner>;

export const Default: Story = {
  args: {
    title: "BYOM program",
    description: "Bring your own model and deploy it inside Aegis Vision.",
    badge: "Beta",
  },
};














