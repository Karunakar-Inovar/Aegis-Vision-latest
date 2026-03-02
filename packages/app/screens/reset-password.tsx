/**
 * Universal Reset Password Screen
 *
 * Works on both Web (via React Native Web) and Native (via React Native)
 * Uses React Native primitives exclusively for cross-platform compatibility.
 */

import * as React from "react";
import { ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { cn } from "ui/utils/cn";
import { View, Text, TextInput, Icon, ThemeToggle, Shield, Check, X, InfoIcon, Sparkles } from "ui";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
  {
    label: "One special character (!@#$%^&*)",
    test: (pwd) => /[!@#$%^&*]/.test(pwd),
  },
];

export interface ResetPasswordProps {
  /** Callback when password reset is successful */
  onSubmit?: (data: { newPassword: string }) => void;
  /** Callback when "Request Early Access" for 2FA is pressed */
  onRequest2FA?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

export function ResetPassword({
  onSubmit,
  onRequest2FA,
  isLoading = false,
  errorMessage,
}: ResetPasswordProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const [newPasswordFocused, setNewPasswordFocused] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);
  const [touched, setTouched] = React.useState({
    newPassword: false,
    confirmPassword: false,
  });

  const error = errorMessage || localError;

  // Check password requirements
  const getRequirementStatus = (requirement: PasswordRequirement) => {
    if (!newPassword) return "pending";
    return requirement.test(newPassword) ? "met" : "unmet";
  };

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every((req) =>
    req.test(newPassword)
  );

  // Validation
  const newPasswordError =
    touched.newPassword && !newPassword
      ? "Password is required"
      : touched.newPassword && !allRequirementsMet
        ? "Password does not meet all requirements"
        : "";

  const confirmPasswordError =
    touched.confirmPassword && !confirmPassword
      ? "Please confirm your password"
      : touched.confirmPassword && newPassword !== confirmPassword
        ? "Passwords do not match"
        : "";

  const isValid =
    newPassword &&
    confirmPassword &&
    allRequirementsMet &&
    newPassword === confirmPassword;

  const handleSubmit = () => {
    setTouched({ newPassword: true, confirmPassword: true });
    setLocalError("");

    if (!newPassword || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!allRequirementsMet) {
      setLocalError("Password does not meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    onSubmit?.({ newPassword });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-background dark:bg-[#1a1f35]"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-end mb-6">
            <ThemeToggle />
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text className="text-3xl font-bold tracking-tight text-foreground dark:text-[#e8ebf0] text-center">
              Reset Your Password
            </Text>
            <Text className="text-base text-muted-foreground dark:text-[#9ca3af] mt-2 text-center">
              First-time login detected. Please set a new secure password.
            </Text>
          </View>

          {/* 2FA Coming Soon Banner */}
          <View className="rounded-xl border-2 border-dashed border-border dark:border-[#4a5568] bg-muted/50 dark:bg-[#2a3147]/50 p-4 mb-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-background dark:bg-[#1a1f35] border border-border dark:border-[#4a5568]">
                <Icon icon={Shield} className="h-6 w-6 text-muted-foreground dark:text-[#9ca3af]" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                  <Text className="font-semibold text-foreground dark:text-[#e8ebf0]">
                    Coming Soon: Two-Factor Authentication
                  </Text>
                  <View className="flex-row items-center gap-1 bg-secondary dark:bg-[#3d4663] px-2 py-0.5 rounded">
                    <Icon icon={Sparkles} className="h-3 w-3 text-secondary-foreground dark:text-[#d4d9e1]" />
                    <Text className="text-xs text-secondary-foreground dark:text-[#d4d9e1]">
                      Early Access
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted-foreground dark:text-[#9ca3af] mb-3">
                  Add an extra layer of security to your account with SMS or
                  authenticator app verification.
                </Text>
                <Pressable
                  onPress={onRequest2FA}
                  className="self-start border border-border dark:border-[#4a5568] rounded-lg px-4 py-2 active:bg-muted dark:active:bg-[#2a3147]"
                >
                  <Text className="text-sm font-medium text-foreground dark:text-[#e8ebf0]">
                    Request Early Access
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Password Form Card */}
          <View className="rounded-xl border border-border dark:border-[#4a5568] bg-card dark:bg-[#2e3750] p-6 mb-6">
            {/* Card Header */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground dark:text-[#e8ebf0]">
                Set New Password
              </Text>
              <Text className="text-sm text-muted-foreground dark:text-[#9ca3af] mt-1">
                Choose a strong password that meets all security requirements.
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="rounded-lg bg-destructive/10 dark:bg-[#e54d4d]/10 border border-destructive/20 dark:border-[#e54d4d]/20 p-3 mb-4">
                <Text className="text-sm text-destructive dark:text-[#e54d4d]">{error}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View className="gap-4">
              {/* New Password */}
              <View>
                <Text className="text-sm font-medium text-foreground dark:text-[#e8ebf0] mb-2">
                  New Password
                </Text>
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => {
                    setNewPasswordFocused(false);
                    setTouched((prev) => ({ ...prev, newPassword: true }));
                  }}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isLoading}
                  className={cn(
                    "w-full rounded-lg border bg-background dark:bg-[#1a1f35] px-4 py-3 text-base text-foreground dark:text-[#e8ebf0]",
                    newPasswordFocused
                      ? "border-primary dark:border-[#7c7cff] border-2"
                      : newPasswordError
                        ? "border-destructive dark:border-[#e54d4d]"
                        : "border-input dark:border-[#4a5568]"
                  )}
                  accessibilityLabel="New password"
                />
                {newPasswordError ? (
                  <Text className="text-xs text-destructive dark:text-[#e54d4d] mt-1">
                    {newPasswordError}
                  </Text>
                ) : null}
              </View>

              {/* Confirm Password */}
              <View>
                <Text className="text-sm font-medium text-foreground dark:text-[#e8ebf0] mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  placeholder="Re-enter password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => {
                    setConfirmPasswordFocused(false);
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  }}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isLoading}
                  className={cn(
                    "w-full rounded-lg border bg-background dark:bg-[#1a1f35] px-4 py-3 text-base text-foreground dark:text-[#e8ebf0]",
                    confirmPasswordFocused
                      ? "border-primary dark:border-[#7c7cff] border-2"
                      : confirmPasswordError
                        ? "border-destructive dark:border-[#e54d4d]"
                        : "border-input dark:border-[#4a5568]"
                  )}
                  accessibilityLabel="Confirm password"
                />
                {confirmPasswordError ? (
                  <Text className="text-xs text-destructive dark:text-[#e54d4d] mt-1">
                    {confirmPasswordError}
                  </Text>
                ) : null}
              </View>

              {/* Password Requirements */}
              <View className="rounded-lg border border-border dark:border-[#4a5568] bg-muted/30 dark:bg-[#2a3147]/30 p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Icon icon={InfoIcon} className="h-4 w-4 text-muted-foreground dark:text-[#9ca3af]" />
                  <Text className="font-semibold text-sm text-foreground dark:text-[#e8ebf0]">
                    Password Requirements
                  </Text>
                </View>
                <View className="gap-2">
                  {PASSWORD_REQUIREMENTS.map((requirement, index) => {
                    const status = getRequirementStatus(requirement);
                    return (
                      <View
                        key={index}
                        className="flex-row items-center gap-2"
                      >
                        {status === "pending" && (
                          <Icon
                            icon={X}
                            className="h-4 w-4 text-muted-foreground dark:text-[#9ca3af]"
                          />
                        )}
                        {status === "met" && (
                          <Icon
                            icon={Check}
                            className="h-4 w-4 text-green-600 dark:text-green-400"
                          />
                        )}
                        {status === "unmet" && (
                          <Icon icon={X} className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <Text
                          className={cn(
                            "text-sm",
                            status === "met"
                              ? "text-green-700 dark:text-green-300"
                              : status === "unmet"
                                ? "text-red-700 dark:text-red-300"
                                : "text-muted-foreground dark:text-[#9ca3af]"
                          )}
                        >
                          {requirement.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View className="border-t border-border dark:border-[#4a5568] pt-4">
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className={cn(
                "h-12 w-full items-center justify-center rounded-lg",
                isLoading 
                  ? "bg-primary/70 dark:bg-[#7c7cff]/70" 
                  : "bg-primary dark:bg-[#7c7cff] active:bg-primary/90 dark:active:bg-[#7c7cff]/90"
              )}
              accessibilityRole="button"
              accessibilityLabel="Set password and continue"
              accessibilityState={{ disabled: isLoading }}
            >
              <Text className="text-base font-semibold text-primary-foreground dark:text-[#1a1f35]">
                {isLoading ? "Setting Password..." : "Set Password & Continue"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

