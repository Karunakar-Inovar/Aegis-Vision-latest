import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, Button } from "ui";
import { CameraOff } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "Molecules/EmptyState",
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoCameras: Story = {
  render: () => (
    <EmptyState
      icon={<CameraOff className="h-10 w-10" />}
      title="No cameras added yet"
      description="Connect your first camera to begin creating monitoring pipelines."
      actions={
        <>
          <Button>Add camera</Button>
          <Button variant="ghost">Import list</Button>
        </>
      }
    />
  ),
};














