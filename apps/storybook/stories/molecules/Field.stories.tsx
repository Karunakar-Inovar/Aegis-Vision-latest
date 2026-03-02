import type { Meta, StoryObj } from "@storybook/react";
import { Field, Input } from "ui";

const meta: Meta<typeof Field> = {
  title: "Molecules/Field",
  component: Field,
};

export default meta;
type Story = StoryObj<typeof Field>;

export const RequiredField: Story = {
  render: () => (
    <Field label="Camera name" required description="Used to identify this feed across the platform.">
      <Input placeholder="Lobby - North Entrance" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field label="RTSP URL" required errorMessage="This URL appears to be invalid. Please double-check.">
      <Input placeholder="rtsp://user:pass@10.0.0.20/live" aria-invalid />
    </Field>
  ),
};














