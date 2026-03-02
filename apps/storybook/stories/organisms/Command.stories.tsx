import type { Meta, StoryObj } from "@storybook/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "ui";

const meta: Meta<typeof Command> = {
  title: "Organisms/Command",
  component: Command,
};

export default meta;
type Story = StoryObj<typeof Command>;

export const CommandPalette: Story = {
  render: () => (
    <Command className="max-w-md">
      <CommandInput placeholder="Search commands…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>
            Cameras
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Pipelines
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};














