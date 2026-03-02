import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "ui";
import { AlertTriangle, CheckCircle } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Alert",
  component: Alert,
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  render: () => (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Model updated</AlertTitle>
      <AlertDescription>The monitoring pipeline now uses Vision Core v2.1.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Connection lost</AlertTitle>
      <AlertDescription>Camera #07 has been offline for 8 minutes.</AlertDescription>
    </Alert>
  ),
};














