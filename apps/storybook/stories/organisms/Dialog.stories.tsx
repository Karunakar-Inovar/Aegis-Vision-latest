import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Text,
} from "ui";

const meta: Meta<typeof Dialog> = {
  title: "Organisms/Dialog",
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const CameraModal: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add camera</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Camera</DialogTitle>
          <DialogDescription>Provide RTSP details and assign to a monitoring pipeline.</DialogDescription>
        </DialogHeader>
        <Text className="text-sm text-muted-foreground">Form contents go here.</Text>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};









