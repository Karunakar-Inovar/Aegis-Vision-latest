import * as React from "react";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../molecules/card";
import { cn } from "../../utils/cn";

export interface FutureFeaturesSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  features?: { label: string; status?: "beta" | "coming-soon" }[];
}

export const FutureFeaturesSection = ({
  className,
  title = "Future Features",
  description = "We are actively working on these capabilities to unlock even more automation.",
  actions,
  features = [
    { label: "Bring Your Own Model", status: "coming-soon" },
    { label: "AI incident summaries", status: "beta" },
  ],
  ...props
}: FutureFeaturesSectionProps) => {
  return (
    <Card className={cn("bg-gradient-to-br from-muted/30 to-muted/60", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Roadmap</Badge>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature.label} className="flex items-center justify-between gap-4 rounded-md border border-dashed border-border/60 px-4 py-3">
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
              {feature.status ? (
                <Badge variant={feature.status === "beta" ? "default" : "secondary"}>
                  {feature.status === "beta" ? "Beta" : "Coming Soon"}
                </Badge>
              ) : null}
            </li>
          ))}
        </ul>
        {actions ?? (
          <Button variant="secondary" className="w-fit">
            Notify me
          </Button>
        )}
      </CardContent>
    </Card>
  );
};














