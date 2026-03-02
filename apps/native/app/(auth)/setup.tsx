/**
 * Native Setup Screen - Minimal
 */

import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Settings, Check } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function SetupScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleComplete = () => {
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 px-6 py-8">
      <View className="flex-1 justify-center">
        <View className="w-full max-w-sm self-center">
          {/* Icon */}
          <View className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 items-center justify-center mb-6 self-center">
            <Settings size={32} color={isDark ? "#818cf8" : "#6366f1"} />
          </View>

          <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Setup Complete
          </Text>
          <Text className="text-base text-slate-600 dark:text-slate-400 text-center mb-8">
            Your account is ready to use
          </Text>

          {/* Checkmarks */}
          <View className="gap-4 mb-8">
            {["Account created", "Password set", "Profile configured"].map((item) => (
              <View key={item} className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 items-center justify-center mr-3">
                  <Check size={16} color="#22c55e" />
                </View>
                <Text className="text-base text-slate-900 dark:text-white">
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleComplete}
            className="h-12 w-full items-center justify-center rounded-lg bg-indigo-500"
          >
            <Text className="text-base font-semibold text-white">
              Go to Dashboard
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
