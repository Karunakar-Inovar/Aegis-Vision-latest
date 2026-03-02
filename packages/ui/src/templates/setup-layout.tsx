import * as React from "react";
import { Progress } from "../atoms/progress";
import { Button } from "../atoms/button";
import { cn } from "../../utils/cn";

export interface SetupLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  hideFooter?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SetupLayout = ({
  children,
  currentStep = 1,
  totalSteps = 6,
  onBack,
  onNext,
  onSkip,
  hideFooter,
  title = "Aegis Vision Setup",
  subtitle = "Configure each section to get started",
  className,
}: SetupLayoutProps) => {
  const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {currentStep} of {totalSteps}</p>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Progress value={progress} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        {children}
      </main>

      {!hideFooter ? (
        <footer className="border-t border-border bg-card/40">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onBack} disabled={!onBack}>
                Back
              </Button>
              <Button variant="ghost" onClick={onSkip} disabled={!onSkip}>
                Skip
              </Button>
            </div>
            <Button onClick={onNext} disabled={!onNext}>
              Next
            </Button>
          </div>
        </footer>
      ) : null}
    </div>
  );
};














