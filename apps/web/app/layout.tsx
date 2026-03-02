"use client";
import React from "react";
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "ui";
import { SocketProvider } from "./context/socket-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

class RootErrorBoundary extends React.Component<
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
    console.error("Root layout error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            background: "#fafafa",
            color: "#171717",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: "#525252", marginBottom: 16 }}>
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable} ${jetBrainsMono.variable} h-full font-sans`}
        style={{
          // Fallback so first paint is never pure black if theme vars load late
          backgroundColor: "var(--background, #fafafa)",
          color: "var(--foreground, #171717)",
        }}
      >
        <RootErrorBoundary>
          <ThemeProvider defaultTheme="light" storageKey="aegis-theme">
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
