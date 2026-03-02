import * as React from "react";
import { Image, Platform, ScrollView, Pressable } from "react-native";
import { cn } from "ui/utils/cn";
import { View, Text, TextInput, Button, Icon, Eye, useTheme } from "ui";
import { APP_BRAND } from "../constants/app-config";

export type UserRole = "Administrator" | "monitor" | "stakeholder";

interface SignInSharedProps {
  onSubmit?: (email: string, password: string, role: UserRole) => Promise<boolean> | boolean;
}

export function SignInShared({ onSubmit }: SignInSharedProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("Administrator");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const { resolvedTheme } = useTheme();

  const isWeb = Platform.OS === "web";
  const logoSrc = resolvedTheme === "dark" ? "/AegisVision-logo-dark.svg" : "/AegisVision-logo.svg";

  const handleSignIn = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter valid credentials");
      return;
    }

    if (!onSubmit) {
      return;
    }

    try {
      const result = await Promise.resolve(onSubmit(email, password, selectedRole));
      if (!result) {
        setError("Please enter valid credentials");
      }
    } catch {
      setError("Please enter valid credentials");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-10">
        {/* Logo */}
        <View className="mb-10">
          <View className="flex-row items-center gap-3">
            {isWeb ? (
              <Image
                source={{ uri: logoSrc }}
                style={{ width: 156, height: 40, resizeMode: "contain" }}
                accessibilityLabel={APP_BRAND.LOGO_ALT}
              />
            ) : (
              <Icon icon={Eye} className="h-8 w-8 text-primary" />
            )}
            <Text className="text-2xl font-bold">Aegis Vision</Text>
          </View>
        </View>

        {/* Form Container */}
        <View className="flex-1 justify-center">
          <View className="w-full max-w-sm self-center space-y-6">
            <View className="space-y-2">
              <Text className="text-3xl font-bold tracking-tight">
                Welcome back!
              </Text>
              <Text className="text-sm text-muted-foreground">
                Select your role and sign in to continue
              </Text>
            </View>

            {/* Role Selector */}
            <View className="space-y-3">
              <Text className="text-sm font-medium">Sign in as:</Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedRole("Administrator")}
                  className={cn(
                    "flex-1 items-center gap-2 rounded-lg border-2 p-4",
                    selectedRole === "Administrator"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Text className="text-2xl">⚙️</Text>
                  <Text className="text-sm font-medium">Admin</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedRole("monitor")}
                  className={cn(
                    "flex-1 items-center gap-2 rounded-lg border-2 p-4",
                    selectedRole === "monitor"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Text className="text-2xl">📹</Text>
                  <Text className="text-sm font-medium">Monitor</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedRole("stakeholder")}
                  className={cn(
                    "flex-1 items-center gap-2 rounded-lg border-2 p-4",
                    selectedRole === "stakeholder"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Text className="text-2xl">📊</Text>
                  <Text className="text-sm font-medium">Viewer</Text>
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium mb-2">Email</Text>
                <TextInput
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full border border-border rounded-lg px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="w-full border border-border rounded-lg px-4 py-3"
                />
              </View>

              <Button
                onPress={handleSignIn}
                variant="default"
                className="w-full justify-center mt-2"
              >
                Sign In
              </Button>
            </View>

            {/* Footer Links */}
            <View className="flex-row items-center justify-between mt-6">
              <Text className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Text className="text-primary font-medium">Sign Up</Text>
              </Text>
              <Text className="text-sm text-primary">Forgot password?</Text>
            </View>

            {/* Terms */}
            <View className="mt-4">
              <Text className="text-xs text-muted-foreground text-center">
                By clicking "Sign In" you agree to the{" "}
                <Text className="underline">Terms of Service</Text> and
                acknowledge the <Text className="underline">Privacy Notice</Text>
                .
              </Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View className="mt-8">
          <Text className="text-sm text-muted-foreground text-center">
            © 2024 Aegis Vision
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}





