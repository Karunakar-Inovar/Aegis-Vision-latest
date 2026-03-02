"use client";

/**
 * Standalone Web Reset Password Screen
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
  Shield,
  Check,
  X,
  InfoIcon,
  Sparkles,
  Field,
  Label,
  Alert,
} from "ui";

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
  onSubmit?: (data: { newPassword: string }) => void;
  onRequest2FA?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function ResetPassword({
  onSubmit,
  onRequest2FA,
  isLoading = false,
  errorMessage,
}: ResetPasswordProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const [touched, setTouched] = React.useState({
    newPassword: false,
    confirmPassword: false,
  });

  const error = errorMessage || localError;

  const getRequirementStatus = (requirement: PasswordRequirement) => {
    if (!newPassword) return "pending";
    return requirement.test(newPassword) ? "met" : "unmet";
  };

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every((req) =>
    req.test(newPassword)
  );

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
    <div className="flex-1">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Reset Your Password
        </h1>
        <p className="text-base text-muted-foreground">
          First-time login detected. Please set a new secure password.
        </p>
      </div>

      {/* 2FA Coming Soon Banner */}
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-background border border-border">
            <Icon icon={Shield} className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground">
                Coming Soon: Two-Factor Authentication
              </span>
              <span className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 rounded">
                <Icon icon={Sparkles} className="h-3 w-3 text-secondary-foreground" />
                <span className="text-xs text-secondary-foreground">
                  Early Access
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Add an extra layer of security to your account with SMS or
              authenticator app verification.
            </p>
            <Button
              variant="outline"
              onPress={onRequest2FA}
              className="self-start"
            >
              <Text className="text-sm font-medium">Request Early Access</Text>
            </Button>
          </div>
        </div>
      </div>

      {/* Password Form Card */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          {/* Card Header */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Set New Password
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a strong password that meets all security requirements.
            </p>
          </div>

          {/* Error Message */}
          {error ? (
            <Alert variant="destructive">
              <Text className="text-sm">{error}</Text>
            </Alert>
          ) : null}

          {/* Form Fields - Using shared Field component */}
          <div className="space-y-4">
            <Field label="New Password" errorMessage={newPasswordError || undefined}>
              <TextInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                onBlur={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
                className={newPasswordError ? "border-destructive" : ""}
                accessibilityLabel="New password"
              />
            </Field>

            <Field label="Confirm Password" errorMessage={confirmPasswordError || undefined}>
              <TextInput
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
                className={confirmPasswordError ? "border-destructive" : ""}
                accessibilityLabel="Confirm password"
              />
            </Field>

            {/* Password Requirements */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon={InfoIcon} className="h-4 w-4 text-muted-foreground" />
                <Label>Password Requirements</Label>
              </div>
              <div className="space-y-2">
                {PASSWORD_REQUIREMENTS.map((requirement, index) => {
                  const status = getRequirementStatus(requirement);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {status === "pending" && (
                        <Icon icon={X} className="h-4 w-4 text-muted-foreground" />
                      )}
                      {status === "met" && (
                        <Icon icon={Check} className="h-4 w-4 text-green-600" />
                      )}
                      {status === "unmet" && (
                        <Icon icon={X} className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${
                          status === "met"
                            ? "text-green-700 dark:text-green-400"
                            : status === "unmet"
                              ? "text-red-700 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {requirement.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            onPress={handleSubmit}
            disabled={isLoading || !isValid}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Setting Password..." : "Set Password & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
