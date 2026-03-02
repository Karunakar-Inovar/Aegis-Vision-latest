import type { Meta, StoryObj } from "@storybook/react";
import { FalsePositiveModal, Button } from "ui";
import { useState } from "react";

const meta: Meta<typeof FalsePositiveModal> = {
  title: "Templates/FalsePositiveModal",
  component: FalsePositiveModal,
};

export default meta;
type Story = StoryObj<typeof FalsePositiveModal>;

export const Modal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Mark as false positive</Button>
        <FalsePositiveModal
          open={open}
          onOpenChange={setOpen}
          cameraName="Dock 02"
          onSubmit={(note) => alert(`Submitted note: ${note}`)}
        />
      </>
    );
  },
};

