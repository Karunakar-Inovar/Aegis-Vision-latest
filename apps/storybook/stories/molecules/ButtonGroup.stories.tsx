import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "ui";
import { ButtonGroup, ButtonGroupItem } from "ui";

const meta: Meta<typeof ButtonGroup> = {
  title: "Molecules/ButtonGroup",
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const CameraControls: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupItem>
        <Button variant="secondary">Start</Button>
      </ButtonGroupItem>
      <ButtonGroupItem>
        <Button variant="secondary">Pause</Button>
      </ButtonGroupItem>
      <ButtonGroupItem>
        <Button variant="secondary">Restart</Button>
      </ButtonGroupItem>
    </ButtonGroup>
  ),
};














