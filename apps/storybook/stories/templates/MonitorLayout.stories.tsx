import type { Meta, StoryObj } from "@storybook/react";
import { MonitorLayout, View, Text } from "ui";

const meta: Meta<typeof MonitorLayout> = {
  title: "Templates/MonitorLayout",
  component: MonitorLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MonitorLayout>;

export const Dashboard: Story = {
  args: {
    currentPath: "/monitor/dashboard",
    userName: "Monitor User",
    userEmail: "monitor@aegis.com",
    alertCount: 5,
    onLogout: () => console.log("Logout clicked"),
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-6 p-6">
        <View>
          <Text className="text-3xl font-bold tracking-tight">Monitor Dashboard</Text>
          <Text className="text-muted-foreground">Live camera feeds and pipeline monitoring</Text>
        </View>
        <View className="flex-row flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} className="w-full flex-1 rounded-lg border bg-card">
              <View className="aspect-video items-center justify-center bg-muted">
                <Text className="text-muted-foreground">Camera {i}</Text>
              </View>
              <View className="gap-1 p-4">
                <Text className="font-semibold">Camera {i}</Text>
                <Text className="text-sm text-muted-foreground">
                  Pipeline: Production Line {Math.ceil(i / 2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    ),
  },
};

export const Summary: Story = {
  args: {
    currentPath: "/monitor/summary",
    userName: "Monitor User",
    userEmail: "monitor@aegis.com",
    alertCount: 5,
    onLogout: () => console.log("Logout clicked"),
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <View className="w-full max-w-2xl rounded-lg border bg-card p-8">
          <Text className="mb-4 text-center text-3xl font-bold">Shift Handover</Text>
          <Text className="text-center text-muted-foreground">
            Review pending issues before starting your shift
          </Text>
        </View>
      </View>
    ),
  },
};

export const NoAlerts: Story = {
  args: {
    currentPath: "/monitor/dashboard",
    userName: "Monitor User",
    userEmail: "monitor@aegis.com",
    alertCount: 0,
    onLogout: () => console.log("Logout clicked"),
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-2 p-6">
        <Text className="text-3xl font-bold tracking-tight">Monitor Dashboard</Text>
        <Text className="text-muted-foreground">No active alerts</Text>
      </View>
    ),
  },
};









