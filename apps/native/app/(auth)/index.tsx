/**
 * Native Sign In Screen - Fresh Start
 * 
 * Using React Native core components with NativeWind styling.
 * This is the shared design that matches web.
 */

import * as React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, Settings, Camera, BarChart3, Sun, Moon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// User roles
type UserRole = "Administrator" | "monitor" | "stakeholder";

// Demo credentials
const DEMO_USERS = {
  admin: { email: "admin@aegis.com", password: "admin123" },
  monitor: { email: "monitor@aegis.com", password: "monitor123" },
  stakeholder: { email: "viewer@aegis.com", password: "viewer123" },
};

export default function SignInScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedRole, setSelectedRole] = React.useState<UserRole>("Administrator");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check demo credentials
    const demoUser = DEMO_USERS[selectedRole];
    if (email === demoUser.email && password === demoUser.password) {
      router.replace("/(tabs)");
    } else {
      setErrorMessage("Invalid credentials. Try the demo credentials.");
    }

    setIsLoading(false);
  };

  const roleOptions = [
    { value: "Administrator" as UserRole, label: "Admin", Icon: Settings },
    { value: "monitor" as UserRole, label: "Monitor", Icon: Camera },
    { value: "stakeholder" as UserRole, label: "Viewer", Icon: BarChart3 },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-slate-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-2">
              <Eye size={32} color={isDark ? "#818cf8" : "#6366f1"} />
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Aegis Vision
              </Text>
            </View>
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

          {/* Form Container */}
          <View className="flex-1 justify-center">
            <View className="w-full max-w-sm self-center">
              {/* Welcome Text */}
              <View className="mb-6">
                <Text className="text-3xl font-bold text-slate-900 dark:text-white">
                  Welcome back!
                </Text>
                <Text className="text-base text-slate-600 dark:text-slate-400 mt-2">
                  Select your role and sign in to continue
                </Text>
              </View>

              {/* Role Selector */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Sign in as:
                </Text>
                <View className="flex-row gap-2">
                  {roleOptions.map((option) => {
                    const isSelected = selectedRole === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setSelectedRole(option.value)}
                        className={`flex-1 items-center gap-2 rounded-xl border-2 p-4 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <option.Icon
                          size={24}
                          color={isSelected ? (isDark ? "#818cf8" : "#6366f1") : (isDark ? "#94a3b8" : "#64748b")}
                        />
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Demo Hint */}
              <View className="rounded-lg p-3 mb-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                <Text className="text-xs text-indigo-600 dark:text-indigo-400">
                  Demo: {DEMO_USERS[selectedRole].email} / {DEMO_USERS[selectedRole].password}
                </Text>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View className="rounded-lg p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                  <Text className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <View className="gap-4 mb-6">
                {/* Email */}
                <View className="gap-2">
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

                {/* Password */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-slate-900 dark:text-white">
                    Password
                  </Text>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    editable={!isLoading}
                    className="h-12 w-full rounded-lg px-4 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  />
                </View>

                {/* Sign In Button */}
                <Pressable
                  onPress={handleSignIn}
                  disabled={isLoading}
                  className={`mt-2 h-12 w-full items-center justify-center rounded-lg ${
                    isLoading ? "bg-indigo-400" : "bg-indigo-500 active:bg-indigo-600"
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="text-base font-semibold text-white">
                      Sign In
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* Footer Links */}
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Sign Up
                  </Text>
                </Text>
                <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                  <Text className="text-sm text-indigo-600 dark:text-indigo-400">
                    Forgot password?
                  </Text>
                </Pressable>
              </View>

              {/* Terms */}
              <View className="mt-6">
                <Text className="text-xs text-slate-500 dark:text-slate-500 text-center leading-5">
                  By clicking "Sign In" you agree to the Terms of Service and
                  acknowledge the Privacy Notice.
                </Text>
              </View>
            </View>
          </View>

          {/* Copyright */}
          <View className="mt-8">
            <Text className="text-sm text-slate-500 dark:text-slate-500 text-center">
              © 2024 Aegis Vision
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
