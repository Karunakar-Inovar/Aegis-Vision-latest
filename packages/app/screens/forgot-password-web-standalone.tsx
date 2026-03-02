"use client";

/**
 * Standalone Web Forgot Password Screen
 * 
 * Uses shared UI components from packages/ui for consistent styling
 * across web and native platforms.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Text,
  TextInput,
  Button,
  Icon,
  ArrowLeft,
  Mail,
  CheckCircle,
  Field,
  Label,
  Alert,
} from "ui";

export interface ForgotPasswordProps {
  onSubmit?: (email: string) => void;
  onBackToSignIn?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function ForgotPassword({
  onSubmit,
  onBackToSignIn,
  isLoading = false,
  errorMessage,
}: ForgotPasswordProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const emailError =
    touched && !email
      ? "Email is required"
      : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Invalid email address"
        : "";

  const isValid = email && !emailError;

  const handleSubmit = () => {
    setTouched(true);
    if (!email || emailError) return;
    onSubmit?.(email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Check Your Email
          </h1>
        </div>

        {/* Success Message */}
        <div className="rounded-xl border border-green-500/20 bg-green-50 dark:bg-green-900/10 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Icon icon={CheckCircle} className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                Reset Link Sent!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                We have sent a password reset link to {email}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="p-6 space-y-4">
            <Label className="block mb-2">Next Steps:</Label>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground">1.</span>
                <span className="text-sm text-muted-foreground flex-1">
                  Check your email inbox (and spam folder)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground">2.</span>
                <span className="text-sm text-muted-foreground flex-1">
                  Click the reset link in the email
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground">3.</span>
                <span className="text-sm text-muted-foreground flex-1">
                  Create a new password
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Did not receive the email? Check your spam folder or try again in a few minutes.
            </p>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-6 py-4 sm:flex-row sm:justify-end">
            <Button onPress={onBackToSignIn} variant="outline" className="w-full sm:w-auto">
              <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
              <Text>Back to Sign In</Text>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Forgot Password?
        </h1>
        <p className="text-base text-muted-foreground">
          No worries! Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {errorMessage ? (
            <Alert variant="destructive">
              <Text className="text-sm">{errorMessage}</Text>
            </Alert>
          ) : null}

          {/* Email Input - Using shared Field component */}
          <Field label="Email Address" errorMessage={emailError || undefined}>
            <TextInput
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(true)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              className={emailError ? "border-destructive" : ""}
              accessibilityLabel="Email address"
            />
          </Field>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onPress={onBackToSignIn} className="w-full sm:w-auto">
            <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
            <Text>Back to Sign In</Text>
          </Button>
          <Button onPress={handleSubmit} disabled={isLoading || !isValid} className="w-full sm:w-auto">
            {isLoading ? (
              <Text>Sending...</Text>
            ) : (
              <>
                <Icon icon={Mail} className="h-4 w-4 mr-2" />
                <Text>Send Reset Link</Text>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
