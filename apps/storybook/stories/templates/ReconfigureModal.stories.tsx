import type { Meta, StoryObj } from "@storybook/react";
import { ReconfigureModal, Button } from "ui";
import { useState } from "react";

const meta: Meta<typeof ReconfigureModal> = {
  title: "Templates/ReconfigureModal",
  component: ReconfigureModal,
};

export default meta;
type Story = StoryObj<typeof ReconfigureModal>;

export const Modal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Reconfigure
        </Button>
        <ReconfigureModal
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert("Reconfiguration confirmed")}
        />
      </>
    );
  },
};

