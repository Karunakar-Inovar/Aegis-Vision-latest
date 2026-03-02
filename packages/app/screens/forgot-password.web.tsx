"use client";

/**
 * Web Forgot Password Screen Wrapper
 *
 * Uses the standalone web ForgotPassword component with Next.js navigation.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { ForgotPassword as WebForgotPassword } from "./forgot-password-web-standalone";

export function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Simulate API call to send reset email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to send the reset email
      console.log("Password reset email sent to:", email);
    } catch (error) {
      setErrorMessage("Failed to send reset email. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push("/");
  };

  return (
    <WebForgotPassword
      onSubmit={handleSubmit}
      onBackToSignIn={handleBackToSignIn}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}

export default ForgotPassword;






