import type { Meta, StoryObj } from "@storybook/react";
import { StakeholderLayout, View, Text } from "ui";

const meta: Meta<typeof StakeholderLayout> = {
  title: "Templates/StakeholderLayout",
  component: StakeholderLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StakeholderLayout>;

export const Reports: Story = {
  args: {
    currentPath: "/stakeholder/reports",
    userName: "John Stakeholder",
    userEmail: "stakeholder@aegis.com",
    onLogout: () => console.log("Logout clicked"),
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-6">
        <View>
          <Text className="text-3xl font-bold tracking-tight">Reports</Text>
          <Text className="text-muted-foreground">View system reports and incident summaries</Text>
        </View>
        <View className="flex-row flex-wrap gap-4">
          {[
            { label: "Total Incidents", value: "42", caption: "Last 30 days" },
            { label: "Critical Alerts", value: "8", caption: "Last 30 days" },
            { label: "System Uptime", value: "99.8%", caption: "Last 30 days" },
          ].map((card) => (
            <View key={card.label} className="w-1/2 rounded-lg border bg-card p-6">
              <Text className="text-sm font-medium text-muted-foreground">{card.label}</Text>
              <Text className="mt-2 text-2xl font-bold">{card.value}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">{card.caption}</Text>
            </View>
          ))}
        </View>
      </View>
    ),
  },
};

export const Analytics: Story = {
  args: {
    currentPath: "/stakeholder/analytics",
    userName: "John Stakeholder",
    userEmail: "stakeholder@aegis.com",
    onLogout: () => console.log("Logout clicked"),
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-2">
        <Text className="text-3xl font-bold tracking-tight">Analytics</Text>
        <Text className="text-muted-foreground">System analytics and performance metrics</Text>
      </View>
    ),
  },
};









