import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleSwitch } from "ui";

const meta: Meta<typeof ToggleSwitch> = {
  title: "Atoms/ToggleSwitch",
  component: ToggleSwitch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the switch is checked/on",
    },
    defaultChecked: {
      control: "boolean",
      description: "Default checked state for uncontrolled usage",
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant of the toggle switch",
    },
    onCheckedChange: {
      action: "checked changed",
      description: "Callback when the switch value changes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

// Default uncontrolled toggle
export const Default: Story = {
  args: {
    defaultChecked: false,
  },
};

// Checked state
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

// Disabled states
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: "sm",
    defaultChecked: true,
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    defaultChecked: true,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    defaultChecked: true,
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Small:</span>
        <ToggleSwitch size="sm" defaultChecked />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Medium:</span>
        <ToggleSwitch size="md" defaultChecked />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Large:</span>
        <ToggleSwitch size="lg" defaultChecked />
      </div>
    </div>
  ),
};

// Controlled example
const ControlledToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-4 items-center">
      <ToggleSwitch
        checked={isEnabled}
        onCheckedChange={setIsEnabled}
        size="md"
      />
      <span className="text-sm text-muted-foreground">
        Status: {isEnabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledToggle />,
};

// With label example
const ToggleWithLabel = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="feature-toggle"
        className="text-sm font-medium text-foreground cursor-pointer"
      >
        {isEnabled ? "Enabled" : "Disabled"}
      </label>
      <ToggleSwitch
        id="feature-toggle"
        checked={isEnabled}
        onCheckedChange={setIsEnabled}
        accessibilityLabel="Toggle feature"
      />
    </div>
  );
};

export const WithLabel: Story = {
  render: () => <ToggleWithLabel />,
};

// Multiple toggles example
const MultipleToggles = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  });

  return (
    <div className="flex flex-col gap-4 w-64">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Notifications</span>
        <ToggleSwitch
          checked={settings.notifications}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, notifications: checked })
          }
          size="md"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Dark Mode</span>
        <ToggleSwitch
          checked={settings.darkMode}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, darkMode: checked })
          }
          size="md"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Auto Save</span>
        <ToggleSwitch
          checked={settings.autoSave}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, autoSave: checked })
          }
          size="md"
        />
      </div>
    </div>
  );
};

export const SettingsExample: Story = {
  render: () => <MultipleToggles />,
};

