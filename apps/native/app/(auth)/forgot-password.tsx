/**
 * Native Forgot Password Screen - Minimal
 */

import * as React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async () => {
    if (!email) return;

    setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
      setIsLoading(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 px-6 py-8">
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center mb-8"
      >
        <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#0f172a"} />
        <Text className="text-base text-slate-900 dark:text-white ml-2">
          Back
        </Text>
      </Pressable>

      <View className="flex-1 justify-center">
        <View className="w-full max-w-sm self-center">
          {/* Icon */}
          <View className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 items-center justify-center mb-6 self-center">
            <Mail size={32} color={isDark ? "#818cf8" : "#6366f1"} />
          </View>

          {submitted ? (
            <>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Check your email
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400 text-center mb-6">
                We've sent a password reset link to {email}
              </Text>
              <Pressable
                onPress={() => router.back()}
                className="h-12 w-full items-center justify-center rounded-lg bg-indigo-500"
              >
                <Text className="text-base font-semibold text-white">
                  Back to Sign In
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Forgot Password?
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400 text-center mb-6">
                Enter your email and we'll send you a reset link
              </Text>

              {/* Email Input */}
              <View className="gap-2 mb-6">
                <Text className="text-sm font-medium text-slate-900 dark:text-white">
                  Email
                </Text>
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                  className="h-12 w-full rounded-lg px-4 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading || !email}
                className={`h-12 w-full items-center justify-center rounded-lg ${
                  isLoading || !email ? "bg-indigo-400" : "bg-indigo-500"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Send Reset Link
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
