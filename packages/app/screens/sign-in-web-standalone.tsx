"use client";

/**
 * Standalone Web Sign In Screen
 * 
 * Uses shared UI components from packages/ui for consistent styling
 * across web and native platforms.
 */

import * as React from "react";
import { Pressable } from "react-native";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  View,
  Text,
  TextInput,
  Button,
  Icon,
  Eye,
  ThemeToggle,
  Settings,
  Camera,
  BarChart,
  Field,
  Label,
  Alert,
  useTheme,
} from "ui";
import {
  login,
  getRedirectPath,
  initializeDemoData,
  type UserRole,
} from "../utils/auth";
import { UI_MESSAGES } from "../constants";
import { APP_BRAND } from "../constants/app-config";

export function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("Administrator");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState({ email: false, password: false });
  const { resolvedTheme } = useTheme();

  const logoSrc = resolvedTheme === "dark" ? "/AegisVision-logo-dark.svg" : "/AegisVision-logo.svg";

  // Validation
  const emailError =
    touched.email && !email
      ? UI_MESSAGES.email.required
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? UI_MESSAGES.email.invalid
        : "";

  const passwordError =
    touched.password && !password ? UI_MESSAGES.password.required : "";

  // Initialize demo data on mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      initializeDemoData();
    }
  }, []);

  const handleSignIn = async () => {
    setTouched({ email: true, password: true });
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!email || !password) {
        setErrorMessage(UI_MESSAGES.auth.signIn.missingCredentials);
        setIsLoading(false);
        return;
      }

      if (emailError || passwordError) {
        setIsLoading(false);
        return;
      }

      const response = await login(email, password, selectedRole);
    
      if (response.user) {
        const redirectPath = getRedirectPath(response.user);
        router.push(redirectPath);
      } else {
        setErrorMessage(response.error || UI_MESSAGES.auth.loginFailed);
      }
    } catch (error: any) {
      console.error("[SignIn] Unexpected error:", error);
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        UI_MESSAGES.system.genericError;
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const roleOptions: { value: UserRole; label: string; icon: typeof Settings }[] = [
    { value: "Administrator", label: UI_MESSAGES.auth.signIn.roles.admin, icon: Settings },
    { value: "monitor", label: UI_MESSAGES.auth.signIn.roles.monitor, icon: Camera },
    { value: "stakeholder", label: UI_MESSAGES.auth.signIn.roles.stakeholder, icon: BarChart },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Sign In Form */}
      <div className="flex flex-col flex-1 w-full lg:w-1/2">
        <div className="flex flex-col flex-1 px-6 py-8">
          {/* Header with Logo and Theme Toggle */}
          <div className="flex flex-row items-center justify-between mb-8 w-full max-w-md mx-auto">
            <div className="flex flex-row items-center gap-2">
              <Image
                src={logoSrc}
                alt={APP_BRAND.LOGO_ALT}
                width={156}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <ThemeToggle />
          </div>

          {/* Form Container - Centered */}
          <div className="flex flex-col flex-1 justify-center">
            <div className="w-full max-w-md mx-auto">
              {/* Welcome Text */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  {UI_MESSAGES.auth.signIn.title}
                </h1>
                {/* <p className="text-base text-muted-foreground">
                  Select your role and sign in to continue
                </p> */}
              </div>

              {/* Role Selector */}
              {/* <div className="mb-6">
                <Label className="mb-3">Sign in as:</Label>
                <div className="flex flex-row gap-2">
                  {roleOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedRole(option.value)}
                      className={`flex-1 items-center gap-2 rounded-xl border-2 p-4 ${
                        selectedRole === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedRole === option.value }}
                    >
                      <Icon
                        icon={option.icon}
                        className={`h-6 w-6 ${
                          selectedRole === option.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          selectedRole === option.value
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </div>
              </div> */}

              {/* Error Message */}
              {errorMessage ? (
                <Alert variant="destructive" className="mb-4">
                  <Text className="text-sm">{errorMessage}</Text>
                </Alert>
              ) : null}

              {/* Form Fields - Using shared Field component */}
              <div className="flex flex-col gap-4 mb-6">
                <Field label={UI_MESSAGES.auth.signIn.emailLabel} errorMessage={emailError || undefined}>
                  <TextInput
                    placeholder={UI_MESSAGES.auth.signIn.emailPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                    className={emailError ? "border-destructive" : ""}
                    accessibilityLabel={UI_MESSAGES.auth.signIn.emailLabel}
                  />
                </Field>

                <Field label={UI_MESSAGES.auth.signIn.passwordLabel} errorMessage={passwordError || undefined}>
                  <TextInput
                    placeholder={UI_MESSAGES.auth.signIn.passwordPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    secureTextEntry
                    autoComplete="password"
                    editable={!isLoading}
                    className={passwordError ? "border-destructive" : ""}
                    accessibilityLabel={UI_MESSAGES.auth.signIn.passwordLabel}
                  />
                </Field>

                <Button
                  onPress={handleSignIn}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading ? UI_MESSAGES.auth.signIn.actionLoading : UI_MESSAGES.auth.signIn.action}
                </Button>
              </div>

              {/* Footer Links */}
              <div className="flex flex-row items-center justify-between mb-6">
                {/* <div className="flex flex-row items-center">
                  <Text className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                  </Text>
                  <Pressable onPress={handleSignUp}>
                    <Text className="text-sm text-primary font-medium">
                      Sign Up
                    </Text>
                  </Pressable>
                </div> */}
                <Pressable onPress={handleForgotPassword}>
                  <Text className="text-sm text-primary">
                    {UI_MESSAGES.auth.signIn.forgotPassword}
                  </Text>
                </Pressable>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6">
                <Text className="text-xs text-muted-foreground text-center leading-5">
                  {UI_MESSAGES.auth.signIn.termsPrefix}{" "}
                  <Text className="underline">{UI_MESSAGES.auth.signIn.termsOfService}</Text>{" "}
                  {UI_MESSAGES.auth.signIn.termsConnector}{" "}
                  <Text className="underline">{UI_MESSAGES.auth.signIn.privacyNotice}</Text>.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (Web only, hidden on mobile) */}
      <div className="hidden lg:flex flex-1 w-1/2 items-center justify-center bg-muted/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center p-10 w-full h-full">
          {/* Illustration */}
          <div className="mb-4 relative">
            <div className="h-[11rem] w-64 rounded-full bg-primary/10 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt={APP_BRAND.LOGO_ALT}
                width={240}
                height={240}
                className="h-48 w-48 object-contain"
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-primary/40" />
            <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary/30" />
            <div className="absolute top-1/2 -right-8 h-6 w-6 rounded-full bg-primary/50" />
            <div className="absolute top-1/4 -left-8 h-10 w-10 rounded-full bg-primary/20" />
          </div>

          {/* Tagline */}
          <Text className="text-3xl font-bold mb-4 text-center text-foreground">
            {UI_MESSAGES.auth.signIn.taglineTitle}
          </Text>
          <Text className="text-muted-foreground max-w-md text-lg text-center">
            {UI_MESSAGES.auth.signIn.taglineBody}
          </Text>
        </div>
      </div>
    </div>
  );
}
