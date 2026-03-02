/**
 * Native Profile Screen - Minimal
 */

import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
      {/* Avatar */}
      <View className="w-32 h-32 rounded-full bg-indigo-500 mb-4 items-center justify-center">
        <Text className="text-5xl text-white font-bold">A</Text>
      </View>

      {/* Name */}
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Admin User
      </Text>

      {/* Role */}
      <Text className="text-lg text-indigo-500 dark:text-indigo-400 mb-6 font-medium">
        System Administrator
      </Text>

      {/* Info Card */}
      <View className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 w-full max-w-xs items-center border border-slate-200 dark:border-slate-700">
        <View className="mb-3">
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Email
          </Text>
          <Text className="text-base text-slate-900 dark:text-white font-medium text-center">
            admin@aegis.com
          </Text>
        </View>

        <View className="w-full h-px bg-slate-200 dark:bg-slate-700 my-3" />

        <View className="mb-3">
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Role
          </Text>
          <Text className="text-base text-slate-900 dark:text-white font-medium text-center">
            Administrator
          </Text>
        </View>

        <View className="w-full h-px bg-slate-200 dark:bg-slate-700 my-3" />

        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-5">
          Aegis Vision AI-Powered Video Surveillance
        </Text>
      </View>
    </View>
  );
}
