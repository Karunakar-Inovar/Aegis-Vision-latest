"use client";

/**
 * Web Reset Password Screen Wrapper
 *
 * Uses the standalone web ResetPassword component with Next.js navigation.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { ResetPassword as WebResetPassword } from "./reset-password-web-standalone";
import { getCurrentUser, resetPassword } from "app/utils/auth";
import { fetchOrganization } from "app/utils/organization";

export function ResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (data: { newPassword: string }) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user = getCurrentUser();
      
      if (!user) {
        setErrorMessage("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const result = await resetPassword(user.id, data.newPassword);

      if (result.success) {
        // For prototype: Store password reset flag
        if (typeof window !== "undefined") {
          localStorage.setItem("passwordReset", "true");
          localStorage.removeItem("setupOverviewAcknowledged");
        }
        const org = await fetchOrganization();
        if(!org) {
          router.push("/admin/setup/overview");
          return;
        }

        // Redirect to setup overview before wizard
        router.push("/admin/dashboard");
      } else {
        setErrorMessage(result.message || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      console.error("[ResetPassword] Unexpected error:", error);
      
      // Extract error message from different possible error structures
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        "An unexpected error occurred. Please try again.";
      
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest2FA = () => {
    // Handle 2FA request - could open a modal or navigate
    alert("2FA early access request submitted!");
  };

  return (
    <WebResetPassword
      onSubmit={handleSubmit}
      onRequest2FA={handleRequest2FA}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}

export default ResetPassword;


