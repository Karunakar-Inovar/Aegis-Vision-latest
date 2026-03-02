import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Button, buttonVariants } from "ui";
import { LucideCamera, Upload } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link", "dark-card"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    children: "Click me",
    variant: "default",
    size: "default",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <View className="flex flex-row flex-wrap gap-4">
      {["default", "destructive", "outline", "secondary", "ghost", "link", "dark-card"].map((variant) => (
        <Button key={variant} variant={variant as Parameters<typeof buttonVariants>[0]["variant"]}>
          {variant}
        </Button>
      ))}
    </View>
  ),
};

/** Dark Card variant - for buttons on dark backgrounds like BYOM cards */
export const DarkCardVariant: Story = {
  render: () => (
    <View className="flex flex-col gap-4">
      {/* Light mode simulation */}
      <View className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
        <View className="flex flex-row items-center justify-between">
          <View>
            <View className="text-lg font-semibold text-white">Bring Your Own Model</View>
            <View className="text-sm text-slate-200/80">Import your custom YOLO, TensorFlow, PyTorch models.</View>
          </View>
          <Button variant="dark-card">
            <Upload className="mr-2 h-4 w-4" />
            Import Model
          </Button>
        </View>
      </View>
    </View>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <View className="flex flex-row items-center gap-4">
      <Button size="icon">
        <LucideCamera className="h-4 w-4" />
      </Button>
      <Button size="icon-sm" variant="secondary">
        <LucideCamera className="h-4 w-4" />
      </Button>
      <Button size="icon-lg" variant="outline">
        <LucideCamera className="h-5 w-5" />
      </Button>
    </View>
  ),
};









