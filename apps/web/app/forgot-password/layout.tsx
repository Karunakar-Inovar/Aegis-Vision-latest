"use client";

import { ThemeToggle } from "ui";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Minimal Header (full width) */}
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-2">
          <svg
            className="h-8 w-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xl font-bold text-foreground">Aegis Vision</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Centered content column */}
      <main className="min-h-[calc(100vh-4rem)] w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}






