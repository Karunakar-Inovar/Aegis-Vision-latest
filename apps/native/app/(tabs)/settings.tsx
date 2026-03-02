/**
 * Native Settings Screen - Minimal
 */

import { View, Text, Pressable } from "react-native";
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Sun, Moon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

const settingsOptions = [
  { label: "Account", description: "Manage your account", icon: User },
  { label: "Notifications", description: "Configure alerts", icon: Bell },
  { label: "Privacy", description: "Security settings", icon: Shield },
  { label: "Help & Support", description: "Get help", icon: HelpCircle },
];

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </Text>
        {/* Theme Toggle */}
        <Pressable
          onPress={toggleColorScheme}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          {isDark ? (
            <Sun size={20} color="#fbbf24" />
          ) : (
            <Moon size={20} color="#6366f1" />
          )}
        </Pressable>
      </View>

      {/* Options */}
      <View className="gap-3">
        {settingsOptions.map((option) => (
          <Pressable
            key={option.label}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex-row items-center border border-slate-200 dark:border-slate-700"
          >
            <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 items-center justify-center mr-4">
              <option.icon size={20} color={isDark ? "#818cf8" : "#6366f1"} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-900 dark:text-white">
                {option.label}
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {option.description}
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? "#64748b" : "#94a3b8"} />
          </Pressable>
        ))}

        {/* Logout */}
        <Pressable className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 flex-row items-center border border-red-200 dark:border-red-500/30 mt-4">
          <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 items-center justify-center mr-4">
            <LogOut size={20} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-red-600 dark:text-red-400">
              Sign Out
            </Text>
            <Text className="text-sm text-red-500/70 dark:text-red-400/70">
              Log out of your account
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
