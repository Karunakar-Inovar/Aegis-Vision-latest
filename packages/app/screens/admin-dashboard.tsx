/**
 * Universal Admin Dashboard Screen
 * 
 * Works on both Web (via React Native Web) and Native (via React Native)
 * Uses React Native primitives for cross-platform compatibility.
 */

import * as React from "react";
import { ScrollView, Pressable, Platform, type PressableStateCallbackType, type ViewStyle, type StyleProp } from "react-native";
import { View, Text, Button, Icon, ThemeToggle } from "ui";
import {
  Camera,
  GitBranch,
  Bell,
  Users,
  AlertCircle,
  ArrowRight,
  Activity,
  AlertTriangle,
} from "ui";
import {
  getIncompleteSteps,
  isSetupComplete,
  getSetupProgress,
} from "../utils/setup";

export interface AdminDashboardProps {
  onNavigateToSetup?: () => void;
  onNavigateToCameras?: () => void;
  onNavigateToPipelines?: () => void;
  onNavigateToIncidents?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToSettings?: () => void;
}

export function AdminDashboard({
  onNavigateToSetup,
  onNavigateToCameras,
  onNavigateToPipelines,
  onNavigateToIncidents,
  onNavigateToNotifications,
  onNavigateToUsers,
  onNavigateToSettings,
}: AdminDashboardProps) {
  const [incompleteSteps, setIncompleteSteps] = React.useState<Array<{ step: number; title: string; description: string }>>([]);
  const [setupComplete, setSetupComplete] = React.useState(false);
  const [setupData, setSetupData] = React.useState<any>(null);

  React.useEffect(() => {
    const complete = isSetupComplete();
    const progress = getSetupProgress();
    
    setSetupComplete(complete);
    setSetupData(progress);
    
    if (!complete) {
      const incomplete = getIncompleteSteps();
      setIncompleteSteps(incomplete);
    }
  }, []);

  // Platform-specific container
  const Container = Platform.OS === "web" ? View : ScrollView;
  const containerProps = Platform.OS === "web" 
    ? { className: "flex-1" }
    : { className: "flex-1 bg-background", contentContainerClassName: "flex-grow" };

  const quickActionPressableStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => ({
    width: "100%",
    opacity: pressed ? 0.85 : 1,
  });

  return (
    <Container {...containerProps}>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              System Dashboard
            </Text>
            <Text className="text-muted-foreground mt-1">
              Overview of your Aegis Vision monitoring system
            </Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Incomplete Setup Warning */}
        {!setupComplete && incompleteSteps.length > 0 && (
          <View className="rounded-xl border border-orange-500 bg-orange-50 dark:bg-orange-900/10 p-4 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon icon={AlertCircle} className="h-5 w-5 text-orange-700 dark:text-orange-400" />
              <Text className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                Complete Your Setup
              </Text>
            </View>
            <Text className="text-sm text-orange-600 dark:text-orange-300 mb-4">
              You have {incompleteSteps.length} required step{incompleteSteps.length > 1 ? "s" : ""} remaining to complete your system setup.
            </Text>
            <View className="gap-3">
              {incompleteSteps.map((step) => (
                <View
                  key={step.step}
                  className="flex-row items-center justify-between rounded-lg border border-border bg-background p-3"
                >
                  <View className="flex-1">
                    <Text className="font-semibold">{step.title}</Text>
                    <Text className="text-sm text-muted-foreground">{step.description}</Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={onNavigateToSetup}
                  >
                    <Text>Complete</Text>
                    <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
                  </Button>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[45%] rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-muted-foreground">Total Cameras</Text>
              <Icon icon={Camera} className="h-4 w-4 text-muted-foreground" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {setupData?.cameras?.length || 0}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {setupData?.cameras?.length ? "Cameras configured" : "No cameras configured"}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-muted-foreground">Active Pipelines</Text>
              <Icon icon={GitBranch} className="h-4 w-4 text-muted-foreground" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {setupData?.pipelines?.length || 0}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {setupData?.pipelines?.length ? "Pipelines running" : "No pipelines configured"}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-muted-foreground">Notifications</Text>
              <Icon icon={Bell} className="h-4 w-4 text-muted-foreground" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {setupData?.notifications?.length || 0}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {setupData?.notifications?.length ? "Channels configured" : "No channels configured"}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-muted-foreground">Team Members</Text>
              <Icon icon={Users} className="h-4 w-4 text-muted-foreground" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {setupData?.invites?.length || 0}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {setupData?.invites?.length ? "Users invited" : "No users invited"}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={onNavigateToCameras}
              style={quickActionPressableStyle}
            >
              <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Icon icon={Camera} className="h-5 w-5 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">View Cameras</Text>
                <Text className="text-sm text-muted-foreground">
                  Monitor live feeds and camera status
                </Text>
              </View>
              <Icon icon={ArrowRight} className="h-4 w-4 text-muted-foreground" />
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToPipelines}
              style={quickActionPressableStyle}
            >
              <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Icon icon={GitBranch} className="h-5 w-5 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">Manage Pipelines</Text>
                <Text className="text-sm text-muted-foreground">
                  Configure AI models and camera assignments
                </Text>
              </View>
              <Icon icon={ArrowRight} className="h-4 w-4 text-muted-foreground" />
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToIncidents}
              style={quickActionPressableStyle}
            >
              <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
                <View className="h-10 w-10 rounded-full bg-destructive/10 items-center justify-center">
                <Icon icon={AlertTriangle} className="h-5 w-5 text-destructive" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">View Incidents</Text>
                <Text className="text-sm text-muted-foreground">
                  Review alerts and incidents
                </Text>
              </View>
              <Icon icon={ArrowRight} className="h-4 w-4 text-muted-foreground" />
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToNotifications}
              style={quickActionPressableStyle}
            >
              <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Icon icon={Bell} className="h-5 w-5 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">Notification Settings</Text>
                <Text className="text-sm text-muted-foreground">
                  Configure alert channels
                </Text>
              </View>
              <Icon icon={ArrowRight} className="h-4 w-4 text-muted-foreground" />
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToUsers}
              style={quickActionPressableStyle}
            >
              <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Icon icon={Users} className="h-5 w-5 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">User Management</Text>
                <Text className="text-sm text-muted-foreground">
                  Manage team members and permissions
                </Text>
              </View>
              <Icon icon={ArrowRight} className="h-4 w-4 text-muted-foreground" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Getting Started / Recent Activity */}
        {!setupComplete ? (
          <View className="rounded-xl border border-border bg-card p-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Getting Started
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Complete the setup wizard to configure your monitoring system
            </Text>
            <Button onPress={onNavigateToSetup}>
              <Text>Start Setup Wizard</Text>
              <Icon icon={ArrowRight} className="h-4 w-4 ml-2" />
            </Button>
          </View>
        ) : (
          <View className="rounded-xl border border-border bg-card p-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              System Status
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <Icon icon={Activity} className="h-5 w-5 text-green-600" />
              <Text className="text-sm text-muted-foreground">
                All systems operational
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              Your Aegis Vision system is fully configured and running.
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
}

