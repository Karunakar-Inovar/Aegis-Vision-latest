import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "ui";
import { InputGroup, InputGroupSuffix, InputGroupText } from "ui";

const meta: Meta<typeof InputGroup> = {
  title: "Molecules/InputGroup",
  component: InputGroup,
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithPrefixSuffix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupText>https://</InputGroupText>
      <Input placeholder="camera.aegisvision.ai" className="border-none focus-visible:ring-0" />
      <InputGroupSuffix>.cloud</InputGroupSuffix>
    </InputGroup>
  ),
};














