import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { StatsCard } from "ui";

const meta: Meta<typeof StatsCard> = {
  title: "Molecules/StatsCard",
  component: StatsCard,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Green: Story = {
  args: {
    label: "Camera Status",
    value: "2/2",
    badge: "Online",
    color: "green",
  },
  render: (args) => (
    <View style={{ width: 240 }}>
      <StatsCard {...args} />
    </View>
  ),
};

export const Blue: Story = {
  args: {
    label: "Stream Latency",
    value: "87ms",
    suffix: "avg",
    color: "blue",
  },
  render: (args) => (
    <View style={{ width: 240 }}>
      <StatsCard {...args} />
    </View>
  ),
};

export const Purple: Story = {
  args: {
    label: "GPU Utilization",
    value: "64%",
    badge: "Normal",
    color: "purple",
  },
  render: (args) => (
    <View style={{ width: 240 }}>
      <StatsCard {...args} />
    </View>
  ),
};

export const Orange: Story = {
  args: {
    label: "Alerts Today",
    value: "12",
    suffix: "events",
    color: "orange",
  },
  render: (args) => (
    <View style={{ width: 240 }}>
      <StatsCard {...args} />
    </View>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
      <View style={{ width: 220 }}>
        <StatsCard
          label="Camera Status"
          value="2/2"
          badge="Online"
          color="green"
        />
      </View>
      <View style={{ width: 220 }}>
        <StatsCard
          label="Stream Latency"
          value="87ms"
          suffix="avg"
          color="blue"
        />
      </View>
      <View style={{ width: 220 }}>
        <StatsCard
          label="GPU Utilization"
          value="64%"
          badge="Normal"
          color="purple"
        />
      </View>
      <View style={{ width: 220 }}>
        <StatsCard
          label="Alerts Today"
          value="12"
          suffix="events"
          color="orange"
        />
      </View>
    </View>
  ),
};

export const LargeValues: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
      <View style={{ width: 220 }}>
        <StatsCard
          label="Total Users"
          value="1,234"
          color="purple"
        />
      </View>
      <View style={{ width: 220 }}>
        <StatsCard
          label="Revenue"
          value="$52.4k"
          suffix="this month"
          color="green"
        />
      </View>
    </View>
  ),
};






