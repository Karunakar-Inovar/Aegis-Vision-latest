import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { LoadingScreen, LoadingIndicator } from "ui";

const meta: Meta<typeof LoadingScreen> = {
  title: "Molecules/LoadingScreen",
  component: LoadingScreen,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof LoadingScreen>;

export const Default: Story = {
  args: {
    visible: true,
    message: "Loading...",
  },
  render: (args) => (
    <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <View style={{ height: 20, backgroundColor: "#ddd", marginBottom: 10, borderRadius: 4 }} />
        <View style={{ height: 20, backgroundColor: "#ddd", marginBottom: 10, borderRadius: 4, width: "70%" }} />
        <View style={{ height: 100, backgroundColor: "#ddd", borderRadius: 8 }} />
      </View>
      <LoadingScreen {...args} />
    </View>
  ),
};

export const WithoutMessage: Story = {
  args: {
    visible: true,
  },
  render: (args) => (
    <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
      <LoadingScreen {...args} />
    </View>
  ),
};

export const SmallSpinner: Story = {
  args: {
    visible: true,
    message: "Please wait...",
    size: "small",
  },
  render: (args) => (
    <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
      <LoadingScreen {...args} />
    </View>
  ),
};

export const NoOverlay: Story = {
  args: {
    visible: true,
    message: "Loading content...",
    overlay: false,
  },
  render: (args) => (
    <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <View style={{ height: 20, backgroundColor: "#ddd", marginBottom: 10, borderRadius: 4 }} />
        <View style={{ height: 20, backgroundColor: "#ddd", marginBottom: 10, borderRadius: 4, width: "70%" }} />
      </View>
      <LoadingScreen {...args} />
    </View>
  ),
};

// LoadingIndicator Stories
export const InlineIndicator: StoryObj<typeof LoadingIndicator> = {
  render: () => (
    <View style={{ padding: 20, gap: 20 }}>
      <LoadingIndicator message="Loading..." />
      <LoadingIndicator size="large" message="Please wait..." />
      <LoadingIndicator />
    </View>
  ),
};

export const InButton: StoryObj<typeof LoadingIndicator> = {
  render: () => (
    <View style={{ padding: 20, gap: 16 }}>
      <View
        style={{
          backgroundColor: "#3b82f6",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <LoadingIndicator size="small" color="#ffffff" message="Saving..." />
      </View>
      <View
        style={{
          backgroundColor: "#22c55e",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <LoadingIndicator size="small" color="#ffffff" message="Processing..." />
      </View>
    </View>
  ),
};






