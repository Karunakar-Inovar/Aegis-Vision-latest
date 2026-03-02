"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { SignIn, UI_MESSAGES, getCurrentUser, getRedirectPath, ROUTES } from "app";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
          <h2 style={{ color: "#c00", marginBottom: "20px" }}>
            {UI_MESSAGES.home.componentErrorTitle}
          </h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              backgroundColor: "#fee",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "left",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {this.state.error?.message || UI_MESSAGES.system.genericError}
          </pre>
          {this.state.error?.stack && (
            <details
              style={{
                marginTop: "20px",
                textAlign: "left",
                maxWidth: "600px",
                margin: "20px auto",
              }}
            >
              <summary style={{ cursor: "pointer", color: "#666", marginBottom: "10px" }}>
                {UI_MESSAGES.home.stackTrace}
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "12px",
                  backgroundColor: "#fee",
                  padding: "20px",
                  borderRadius: "8px",
                  overflow: "auto",
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const redirectPath = getRedirectPath(currentUser);

      // If the redirect would land back on this page, stop the loop and show sign-in
      if (!redirectPath || redirectPath === ROUTES.ROOT || redirectPath === pathname) {
        setIsRedirecting(false);
        return;
      }

      setIsRedirecting(true);
      router.replace(redirectPath);
    }
  }, [router, pathname]);

  if (isRedirecting) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            {UI_MESSAGES.home.loadingTitle}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {UI_MESSAGES.home.loadingSubtitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SignIn />
    </ErrorBoundary>
  );
}
