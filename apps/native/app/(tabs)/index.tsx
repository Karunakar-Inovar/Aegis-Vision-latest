/**
 * Native Dashboard Screen - Minimal
 */

import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Camera, AlertTriangle, Users, Activity, Bell, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function DashboardScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const stats = [
    { title: "Cameras", value: "12", icon: Camera },
    { title: "Alerts", value: "3", icon: AlertTriangle },
    { title: "Users", value: "8", icon: Users },
    { title: "Uptime", value: "99.9%", icon: Activity },
  ];

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-slate-900"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </Text>
        <Text className="text-base text-slate-600 dark:text-slate-400 mt-1">
          Welcome back, Admin
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {stats.map((stat) => (
          <View
            key={stat.title}
            className="flex-1 min-w-[140px] bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <View className="flex-row items-center mb-3">
              <stat.icon size={20} color={isDark ? "#818cf8" : "#6366f1"} />
              <Text className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                {stat.title}
              </Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Alerts */}
      <View className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <View className="flex-row items-center mb-4">
          <Bell size={20} color={isDark ? "#818cf8" : "#6366f1"} />
          <Text className="text-lg font-semibold text-slate-900 dark:text-white ml-2">
            Recent Alerts
          </Text>
        </View>

        {[
          { title: "Motion detected", location: "Camera 3", time: "2 min ago" },
          { title: "Object detection", location: "Camera 7", time: "15 min ago" },
          { title: "Low visibility", location: "Camera 2", time: "1 hour ago" },
        ].map((alert, index) => (
          <View
            key={index}
            className={`py-3 ${index > 0 ? "border-t border-slate-200 dark:border-slate-700" : ""}`}
          >
            <Text className="text-base font-medium text-slate-900 dark:text-white">
              {alert.title}
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              {alert.location} · {alert.time}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-3 mt-6">
        <Pressable className="flex-1 bg-indigo-500 rounded-xl p-4 flex-row items-center justify-center">
          <Camera size={20} color="#ffffff" />
          <Text className="text-sm font-semibold text-white ml-2">
            View Cameras
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/settings")}
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex-row items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          <Settings size={20} color={isDark ? "#e2e8f0" : "#0f172a"} />
          <Text className="text-sm font-semibold text-slate-900 dark:text-white ml-2">
            Settings
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
