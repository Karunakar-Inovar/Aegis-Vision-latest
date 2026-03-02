"use client";

/**
 * Web Sign In Screen Wrapper
 *
 * Uses the universal SignIn component with Next.js navigation.
 * Includes web-specific features like the illustration panel.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { View, Text, Icon, Eye, ThemeToggle } from "ui";
import { SignIn as UniversalSignIn, type UserRole } from "./sign-in";
import {
  login,
  getRedirectPath,
  initializeDemoData,
} from "../utils/auth";

export function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Initialize demo data on mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      initializeDemoData();
    }
  }, []);

  const handleSignIn = async (data: {
    email: string;
    password: string;
    role: UserRole;
  }) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { user, error } = await login(data.email, data.password, data.role);
    
      if (user) {
        const redirectPath = getRedirectPath(user);
        router.push(redirectPath);
      } else {
        setErrorMessage(error || "Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      console.error("[SignIn] Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
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

  return (
    <View className="flex min-h-screen w-full flex-row">
      {/* Left Side - Sign In Form */}
      <View className="w-full lg:w-1/2">
        <UniversalSignIn
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
          errorMessage={errorMessage}
                />
      </View>

      {/* Right Side - Illustration (Web only, hidden on mobile) */}
      <View className="hidden lg:flex lg:w-1/2 items-center justify-center bg-muted/30 relative overflow-hidden">
        <View className="relative z-10 flex flex-col items-center justify-center p-12">
          {/* Logo Circle */}
          <View className="mb-8">
            <View className="relative">
              <View className="h-64 w-64 rounded-full bg-primary/20 items-center justify-center">
                <Icon icon={Eye} className="h-32 w-32 text-primary" />
              </View>
              {/* Decorative elements */}
              <View className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-primary/40" />
              <View className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary/30" />
              <View className="absolute top-1/2 -right-8 h-6 w-6 rounded-full bg-primary/50" />
              <View className="absolute top-1/4 -left-8 h-10 w-10 rounded-full bg-primary/20" />
            </View>
          </View>

          {/* Tagline */}
          <Text className="text-3xl font-bold mb-4 text-center text-foreground">
            AI-Powered Video Surveillance
          </Text>
          <Text className="text-muted-foreground max-w-md text-lg text-center">
            Monitor, detect, and respond to incidents in real-time with
            intelligent video analytics.
          </Text>
        </View>
        
        {/* Background pattern */}
        <View className="absolute inset-0 opacity-5">
          <Text className="absolute top-10 left-10 text-9xl text-foreground">
            +
          </Text>
          <Text className="absolute top-20 right-20 text-7xl text-foreground">
            +
          </Text>
          <Text className="absolute bottom-32 left-32 text-6xl text-foreground">
            +
          </Text>
          <Text className="absolute bottom-20 right-40 text-8xl text-foreground">
            +
          </Text>
          <Text className="absolute top-1/2 left-1/4 text-5xl text-foreground">
            +
          </Text>
          <Text className="absolute top-1/3 right-1/3 text-7xl text-foreground">
            +
          </Text>
        </View>
      </View>
    </View>
  );
}
