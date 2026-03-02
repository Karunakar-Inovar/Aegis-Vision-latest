/**
 * Native Reset Password Screen - Minimal
 */

import * as React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 px-6 py-8">
      <View className="flex-1 justify-center">
        <View className="w-full max-w-sm self-center">
          {/* Icon */}
          <View className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 items-center justify-center mb-6 self-center">
            <Lock size={32} color={isDark ? "#818cf8" : "#6366f1"} />
          </View>

          <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Reset Password
          </Text>
          <Text className="text-base text-slate-600 dark:text-slate-400 text-center mb-6">
            Create a new password for your account
          </Text>

          {/* Error */}
          {error ? (
            <View className="rounded-lg p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <Text className="text-sm text-red-600 dark:text-red-400">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="gap-4 mb-6">
            <View className="gap-2">
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                New Password
              </Text>
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!isLoading}
                className="h-12 w-full rounded-lg px-4 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                Confirm Password
              </Text>
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
                className="h-12 w-full rounded-lg px-4 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className={`mt-2 h-12 w-full items-center justify-center rounded-lg ${
                isLoading ? "bg-indigo-400" : "bg-indigo-500"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Reset Password
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
