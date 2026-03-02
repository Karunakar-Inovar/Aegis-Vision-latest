"use client";

/**
 * Monitor Reset Password Screen Wrapper
 *
 * Uses the standalone web ResetPassword component with Next.js navigation.
 * Redirects to monitor dashboard after password reset.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { ResetPassword as WebResetPassword } from "app/screens/reset-password-web-standalone";
import { getCurrentUser, resetPassword } from "app";
import { ROUTES, UI_MESSAGES } from "app/constants";

export default function MonitorResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (data: { newPassword: string }) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // For prototype: Store password reset flag

      const user = getCurrentUser();

      if (!user) {
        setErrorMessage(UI_MESSAGES.auth.userNotFound);
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

        // Redirect to setup overview before wizard
        router.push(ROUTES.MONITOR.DASHBOARD);
      } else {
        setErrorMessage(
          result.message || UI_MESSAGES.password.resetFailed,
        );
      }

      // Redirect to monitor dashboard after password reset
    } catch (error) {
      setErrorMessage(UI_MESSAGES.system.genericError);
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
