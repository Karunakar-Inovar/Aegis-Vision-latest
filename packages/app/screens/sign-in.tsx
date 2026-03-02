/**
 * Universal Sign In Screen
 *
 * Works on both Web (via React Native Web) and Native (via React Native)
 * Uses React Native primitives exclusively for cross-platform compatibility.
 */

import * as React from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { cn } from "ui/utils/cn";
import {
  View,
  Text,
  TextInput,
  Button,
  Icon,
  Eye,
  Settings,
  Camera,
  BarChart,
  ThemeToggle,
  Field,
  Label,
  Alert,
  useTheme,
} from "ui";
import { APP_BRAND } from "../constants/app-config";

export type UserRole = "Administrator" | "monitor" | "stakeholder";

export interface SignInProps {
  /** Callback when sign in is successful */
  onSignIn?: (data: { email: string; password: string; role: UserRole }) => void;
  /** Callback when "Sign Up" is pressed */
  onSignUp?: () => void;
  /** Callback when "Forgot Password" is pressed */
  onForgotPassword?: () => void;
  /** Initial role selection */
  initialRole?: UserRole;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

export function SignIn({
  onSignIn,
  onSignUp,
  onForgotPassword,
  initialRole = "Administrator",
  isLoading = false,
  errorMessage,
}: SignInProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialRole);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const [touched, setTouched] = React.useState({ email: false, password: false });

  const error = errorMessage || localError;

  // Validation
  const emailError =
    touched.email && !email
      ? "Email is required"
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Invalid email address"
        : "";

  const passwordError =
    touched.password && !password
      ? "Password is required"
      : touched.password && password.length < 8
        ? "Password must be at least 8 characters"
        : "";

  const isValid = email && password && !emailError && !passwordError;

  const handleSignIn = () => {
    console.log("📝 handleSignIn called", { email, password, role: selectedRole, emailError, passwordError });
    setTouched({ email: true, password: true });
    setLocalError("");

    if (!email || !password) {
      console.log("❌ Missing email or password");
      setLocalError("Please enter your email and password");
      return;
    }

    if (emailError || passwordError) {
      console.log("❌ Validation errors:", { emailError, passwordError });
      return;
    }

    console.log("✅ Validation passed, calling onSignIn");
    onSignIn?.({ email, password, role: selectedRole });
  };

  const roleOptions: { value: UserRole; label: string; icon: typeof Settings }[] = [
    { value: "Administrator", label: "Admin", icon: Settings },
    { value: "monitor", label: "Monitor", icon: Camera },
    { value: "stakeholder", label: "Viewer", icon: BarChart },
  ];

  const isWeb = Platform.OS === "web";
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/AegisVision-logo-dark.svg" : "/AegisVision-logo.svg";

  // On web, use simple View wrappers instead of applying keyboard avoidance
  const Container = isWeb ? View : KeyboardAvoidingView;
  const containerProps = isWeb
    ? { className: "flex-1" }
    : { behavior: Platform.OS === "ios" ? "padding" : "height" as const, className: "flex-1" };

  const ScrollContainer = isWeb ? View : ScrollView;
  const scrollProps = isWeb
    ? { className: "flex-1 bg-background dark:bg-[#1a1f35] overflow-y-auto" }
    : {
        className: "flex-1 bg-background dark:bg-[#1a1f35]",
        contentContainerClassName: "flex-grow",
        keyboardShouldPersistTaps: "handled" as const,
        showsVerticalScrollIndicator: false,
        bounces: true,
      };

  return (
    <Container {...containerProps}>
      <ScrollContainer {...scrollProps}>
        <View className="flex-1 px-6 py-8">
          {/* Header with Logo and Theme Toggle */}
          <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center gap-3">
            {isWeb ? (
              <Image
                source={{ uri: logoSrc }}
                style={{ width: 156, height: 40, resizeMode: "contain" }}
                accessibilityLabel={APP_BRAND.LOGO_ALT}
              />
            ) : (
              <Icon icon={Eye} className="h-8 w-8 text-primary dark:text-[#7c7cff]" />
            )}
            <Text className="text-2xl font-bold text-foreground dark:text-[#e8ebf0]">
              Aegis Vision
            </Text>
          </View>
            <ThemeToggle />
        </View>

        {/* Form Container */}
        <View className="flex-1 justify-center">
            <View className="w-full max-w-sm self-center">
              {/* Welcome Text */}
              <View className="mb-6">
                <Text className="text-3xl font-bold tracking-tight text-foreground dark:text-[#e8ebf0]">
                Welcome back!
              </Text>
                <Text className="text-base text-muted-foreground dark:text-[#9ca3af] mt-2">
                Select your role and sign in to continue
              </Text>
            </View>

            {/* Role Selector - Using shared Label component */}
              <View className="mb-6 gap-3">
                <Label>Sign in as:</Label>
              <View className="flex-row gap-2">
                  {roleOptions.map((option) => (
                <Pressable
                      key={option.value}
                      onPress={(e) => {
                        console.log("🔘 Role selected:", option.value, { event: e });
                        setSelectedRole(option.value);
                      }}
                  className={cn(
                        "flex-1 items-center gap-2 rounded-xl border-2 p-4",
                        selectedRole === option.value
                      ? "border-primary dark:border-[#7c7cff] bg-primary/5 dark:bg-[#7c7cff]/10"
                          : "border-border dark:border-[#4a5568] bg-card dark:bg-[#2e3750]"
                  )}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedRole === option.value }}
                      accessibilityLabel={`Sign in as ${option.label}`}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon
                        icon={option.icon}
                  className={cn(
                          "h-6 w-6",
                          selectedRole === option.value
                            ? "text-primary dark:text-[#7c7cff]"
                            : "text-muted-foreground dark:text-[#9ca3af]"
                  )}
                      />
                      <Text
                  className={cn(
                          "text-sm font-medium",
                          selectedRole === option.value
                            ? "text-primary dark:text-[#7c7cff]"
                            : "text-foreground dark:text-[#e8ebf0]"
                  )}
                >
                        {option.label}
                      </Text>
                </Pressable>
                  ))}
              </View>
            </View>

            {/* Error Message - Using shared Alert component */}
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <Text className="text-sm">{error}</Text>
              </Alert>
            ) : null}

              {/* Form Fields - Using shared Field and Input components */}
              <View className="gap-4 mb-6">
                {/* Email Field */}
                <Field
                  label="Email"
                  errorMessage={emailError || undefined}
                >
                  <TextInput
                    placeholder="email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                    className={emailError ? "border-destructive" : ""}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your email address"
                  />
                </Field>

                {/* Password Field */}
                <Field
                  label="Password"
                  errorMessage={passwordError || undefined}
                >
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    secureTextEntry
                    autoComplete="password"
                    editable={!isLoading}
                    className={passwordError ? "border-destructive" : ""}
                    accessibilityLabel="Password"
                    accessibilityHint="Enter your password"
                  />
                </Field>

                {/* Sign In Button */}
                <Button
                  onPress={() => {
                    console.log("🔘 Sign in button onPress triggered");
                    handleSignIn();
                  }}
                  disabled={isLoading}
                  className={cn(
                    "mt-2 h-12 w-full items-center justify-center rounded-lg",
                    isLoading 
                      ? "bg-primary/70 dark:bg-[#7c7cff]/70" 
                      : "bg-primary dark:bg-[#7c7cff] active:bg-primary/90 dark:active:bg-[#7c7cff]/90"
                  )}
                  textClassName="text-base font-semibold text-primary-foreground dark:text-[#1a1f35]"
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                  accessibilityState={{ disabled: isLoading }}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
            </View>

            {/* Footer Links */}
              <View className="flex-row items-center justify-between">
                <Pressable 
                  onPress={(e) => {
                    console.log("🔗 Sign up pressed", { event: e, handler: !!onSignUp });
                    if (onSignUp) {
                      onSignUp();
                    } else {
                      console.warn("onSignUp handler is not defined");
                    }
                  }} 
                  accessibilityRole="link"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
              <Text className="text-sm text-muted-foreground dark:text-[#9ca3af]">
                Don't have an account?{" "}
                <Text className="text-primary dark:text-[#7c7cff] font-medium">Sign Up</Text>
              </Text>
                </Pressable>
                <Pressable 
                  onPress={(e) => {
                    console.log("🔗 Forgot password pressed", { event: e, handler: !!onForgotPassword });
                    if (onForgotPassword) {
                      onForgotPassword();
                    } else {
                      console.warn("onForgotPassword handler is not defined");
                    }
                  }} 
                  accessibilityRole="link"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
              <Text className="text-sm text-primary dark:text-[#7c7cff]">Forgot password?</Text>
                </Pressable>
            </View>

            {/* Terms */}
              <View className="mt-6">
                <Text className="text-xs text-muted-foreground dark:text-[#9ca3af] text-center leading-5">
                By clicking "Sign In" you agree to the{" "}
                <Text className="underline">Terms of Service</Text> and
                  acknowledge the{" "}
                  <Text className="underline">Privacy Notice</Text>.
              </Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View className="mt-8">
          <Text className="text-sm text-muted-foreground dark:text-[#9ca3af] text-center">
            © 2024 Aegis Vision
          </Text>
        </View>
      </View>
      </ScrollContainer>
    </Container>
  );
}
