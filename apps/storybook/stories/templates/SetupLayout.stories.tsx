import type { Meta, StoryObj } from "@storybook/react";
import { SetupLayout, Card, CardContent } from "ui";

const meta: Meta<typeof SetupLayout> = {
  title: "Templates/SetupLayout",
  component: SetupLayout,
};

export default meta;
type Story = StoryObj<typeof SetupLayout>;

export const WizardStep: Story = {
  args: {
    currentStep: 2,
    totalSteps: 6,
  },
  render: (args) => (
    <SetupLayout {...args}>
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Wizard content placeholder
        </CardContent>
      </Card>
    </SetupLayout>
  ),
};














