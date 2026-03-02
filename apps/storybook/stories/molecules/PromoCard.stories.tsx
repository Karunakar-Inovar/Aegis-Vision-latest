import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { PromoCard } from "ui";

const meta: Meta<typeof PromoCard> = {
  title: "Molecules/PromoCard",
  component: PromoCard,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1e293b" },
        { name: "light", value: "#f8fafc" },
      ],
    },
  },
  argTypes: {
    onButtonPress: { action: "buttonPressed" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof PromoCard>;

export const Default: Story = {
  args: {
    title: "Advanced AI Features",
    description: "Bring your own models or create custom AI models without code",
    buttonText: "Request Early Access",
    glowText: "Unlock AI Power",
    dismissible: true,
  },
  render: (args) => (
    <View style={{ width: 260, paddingBottom: 20 }}>
      <PromoCard {...args} />
    </View>
  ),
};

export const WithoutGlow: Story = {
  args: {
    title: "Advanced AI Features",
    description: "Bring your own models or create custom AI models without code",
    buttonText: "Request Early Access",
    dismissible: true,
  },
  render: (args) => (
    <View style={{ width: 260, paddingBottom: 10 }}>
      <PromoCard {...args} />
    </View>
  ),
};

export const CustomAIModels: Story = {
  args: {
    title: "Custom AI Models",
    description: "Import your own YOLO, TensorFlow, or PyTorch models",
    buttonText: "Learn More",
    glowText: "Currently High on Creativity",
    dismissible: true,
  },
  render: (args) => (
    <View style={{ width: 260, paddingBottom: 20 }}>
      <PromoCard {...args} />
    </View>
  ),
};

export const BetaFeature: Story = {
  args: {
    title: "Bulk User Upload",
    description: "Import multiple users via CSV with automatic role assignment",
    buttonText: "Try Beta",
    glowText: "Early Access Available",
    dismissible: true,
  },
  render: (args) => (
    <View style={{ width: 260, paddingBottom: 20 }}>
      <PromoCard {...args} />
    </View>
  ),
};

export const NonDismissible: Story = {
  args: {
    title: "Premium Feature",
    description: "Unlock advanced analytics and insights for your team",
    buttonText: "Upgrade Now",
    glowText: "Limited Time Offer",
    dismissible: false,
  },
  render: (args) => (
    <View style={{ width: 260, paddingBottom: 20 }}>
      <PromoCard {...args} />
    </View>
  ),
};

export const InSidebar: Story = {
  args: {
    title: "Advanced AI Features",
    description: "Bring your own models or create custom AI models without code",
    buttonText: "Request Early Access",
    glowText: "Unlock AI Power",
    dismissible: true,
  },
  render: (args) => (
    <View style={{ width: 220, padding: 12, paddingBottom: 30, backgroundColor: "#334155", borderRadius: 8 }}>
      <PromoCard {...args} />
    </View>
  ),
};

