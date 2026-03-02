/**
 * Universal Forgot Password Screen
 * 
 * Works on both Web (via React Native Web) and Native (via React Native)
 * Uses React Native primitives for cross-platform compatibility.
 */

import * as React from "react";
import { ScrollView, Pressable, Platform, Alert, type StyleProp, type ViewStyle } from "react-native";
import {
  View,
  Text,
  TextInput,
  Button,
  Icon,
  ThemeToggle,
  ArrowLeft,
  Mail,
  CheckCircle,
} from "ui";

export interface ForgotPasswordProps {
  /** Callback when password reset email is sent */
  onSubmit?: (email: string) => void;
  /** Callback to go back to sign in */
  onBackToSignIn?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

export function ForgotPassword({
  onSubmit,
  onBackToSignIn,
  isLoading = false,
  errorMessage,
}: ForgotPasswordProps) {
  const [email, setEmail] = React.useState("");
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Validation
  const emailError =
    touched && !email
      ? "Email is required"
      : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Invalid email address"
        : "";

  const isValid = email && !emailError;

  const handleSubmit = () => {
    setTouched(true);

    if (!email) {
      return;
    }

    if (emailError) {
      return;
    }

    // Simulate sending reset email
    onSubmit?.(email);
    setIsSubmitted(true);
  };

  const centeredContainerStyle: StyleProp<ViewStyle> = {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
  };

  // Platform-specific container
  const Container = Platform.OS === "web" ? View : ScrollView;
  const containerProps = Platform.OS === "web" 
    ? { className: "flex-1" }
    : { className: "flex-1 bg-background", contentContainerClassName: "flex-grow" };

  // Success state
  if (isSubmitted) {
    return (
      <Container {...containerProps}>
        <View className="flex-1 px-6 py-8" style={centeredContainerStyle}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-foreground">
              Check Your Email
            </Text>
            <ThemeToggle />
          </View>

          {/* Success Message */}
          <View className="rounded-xl border border-green-500/20 bg-green-50 dark:bg-green-900/10 p-6 mb-6">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center">
                <Icon icon={CheckCircle} className="h-6 w-6 text-green-600 dark:text-green-400" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  Reset Link Sent!
                </Text>
                <Text className="text-sm text-green-700 dark:text-green-400">
                  We've sent a password reset link to{" "}
                  <Text className="font-medium">{email}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View className="rounded-xl border border-border bg-card p-6 mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              Next Steps:
            </Text>
            <View className="gap-2 mb-4">
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-muted-foreground">1.</Text>
                <Text className="text-sm text-muted-foreground flex-1">
                  Check your email inbox (and spam folder)
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-muted-foreground">2.</Text>
                <Text className="text-sm text-muted-foreground flex-1">
                  Click the reset link in the email
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-muted-foreground">3.</Text>
                <Text className="text-sm text-muted-foreground flex-1">
                  Create a new password
                </Text>
              </View>
            </View>
            <Text className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </Text>
          </View>

          {/* Back to Sign In */}
          <Button
            onPress={onBackToSignIn}
            variant="outline"
            className="w-full"
          >
            <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
            <Text>Back to Sign In</Text>
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container {...containerProps}>
      <View className="flex-1 px-6 py-8" style={centeredContainerStyle}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Forgot Password?
          </Text>
          <ThemeToggle />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-base text-muted-foreground">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4">
            <Text className="text-sm text-destructive">{errorMessage}</Text>
          </View>
        )}

        {/* Form */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Email Address
            </Text>
            <TextInput
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                setTouched(true);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              className={`w-full rounded-lg border bg-background px-4 py-3 text-base text-foreground ${
                emailFocused
                  ? "border-primary border-2"
                  : emailError
                    ? "border-destructive"
                    : "border-input"
              }`}
            />
            {emailError ? (
              <Text className="text-xs text-destructive mt-1">
                {emailError}
              </Text>
            ) : null}
          </View>

          <Button
            onPress={handleSubmit}
            disabled={isLoading || !isValid}
            className="w-full h-12"
          >
            {isLoading ? (
              <Text>Sending...</Text>
            ) : (
              <>
                <Icon icon={Mail} className="h-4 w-4 mr-2" />
                <Text>Send Reset Link</Text>
              </>
            )}
          </Button>
        </View>

        {/* Back to Sign In */}
        <View className="flex-row items-center justify-center">
          <Pressable onPress={onBackToSignIn}>
            <View className="flex-row items-center gap-2">
              <Icon icon={ArrowLeft} className="h-4 w-4 text-muted-foreground" />
              <Text className="text-sm text-primary">Back to Sign In</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

