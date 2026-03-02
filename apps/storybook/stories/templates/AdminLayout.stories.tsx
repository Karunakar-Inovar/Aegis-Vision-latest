import type { Meta, StoryObj } from "@storybook/react";
import { AdminLayout, View, Text } from "ui";

const meta: Meta<typeof AdminLayout> = {
  title: "Templates/AdminLayout",
  component: AdminLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdminLayout>;

export const Default: Story = {
  args: {
    currentPath: "/admin/dashboard",
    userName: "Admin User",
    userEmail: "admin@aegis.com",
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-6">
        <View>
          <Text className="text-3xl font-bold tracking-tight">System Dashboard</Text>
          <Text className="text-muted-foreground">Overview of your Aegis Vision monitoring system</Text>
        </View>
        <View className="flex-row flex-wrap gap-4">
          {[
            { label: "Total Cameras", value: "12" },
            { label: "Active Pipelines", value: "4" },
            { label: "Incidents Today", value: "7" },
            { label: "System Health", value: "98%" },
          ].map((card) => (
            <View key={card.label} className="w-1/2 rounded-lg border bg-card p-6">
              <Text className="text-sm font-medium text-muted-foreground">{card.label}</Text>
              <Text className="mt-2 text-2xl font-bold">{card.value}</Text>
            </View>
          ))}
        </View>
      </View>
    ),
  },
};

export const CamerasPage: Story = {
  args: {
    currentPath: "/admin/cameras",
    userName: "Admin User",
    userEmail: "admin@aegis.com",
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-2">
        <Text className="text-3xl font-bold tracking-tight">Camera Management</Text>
        <Text className="text-muted-foreground">Configure and manage your IP cameras</Text>
      </View>
    ),
  },
};

export const ModelsPage: Story = {
  args: {
    currentPath: "/admin/models",
    userName: "Admin User",
    userEmail: "admin@aegis.com",
    logoutLabel: "Log out",
    userMenuTitle: "User menu",
    children: (
      <View className="gap-2">
        <Text className="text-3xl font-bold tracking-tight">AI Models</Text>
        <Text className="text-muted-foreground">Manage your AI detection models</Text>
      </View>
    ),
  },
};









