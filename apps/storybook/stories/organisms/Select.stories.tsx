import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "ui";

const meta: Meta<typeof Select> = {
  title: "Organisms/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: "A dropdown select component that works on both web and native platforms.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/** Default select with placeholder */
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Select with a pre-selected value */
export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="option2">
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Camera type selector with groups */
export const CameraType: Story = {
  render: () => (
    <Select defaultValue="rtsp">
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Choose type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Supported</SelectLabel>
          <SelectItem value="rtsp">RTSP Stream</SelectItem>
          <SelectItem value="nvr">NVR (ONVIF)</SelectItem>
          <SelectItem value="webhook">Webhook</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Coming soon</SelectLabel>
          <SelectItem value="s3" disabled>
            S3 bucket
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/** AI Model selector - as used in the pipeline setup */
export const AIModelSelector: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-full max-w-md">
        <SelectValue placeholder="Choose a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="yolov8-intrusion">YOLOv8 – Intrusion Detection</SelectItem>
        <SelectItem value="yolov8-ppe">YOLOv8 – PPE Compliance</SelectItem>
        <SelectItem value="yolov8-fire">YOLOv8 – Fire Detection</SelectItem>
        <SelectItem value="openvino-counting">OpenVINO – Object Counting</SelectItem>
        <SelectItem value="custom">Custom Model (BYOM)</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Small size variant */
export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-[180px]">
        <SelectValue placeholder="Select size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="xs">Extra Small</SelectItem>
        <SelectItem value="sm">Small</SelectItem>
        <SelectItem value="md">Medium</SelectItem>
        <SelectItem value="lg">Large</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Multiple selects in a form layout */
export const InFormLayout: Story = {
  render: () => (
    <View className="flex flex-col gap-4 max-w-md">
      <View className="gap-2">
        <View className="text-sm font-medium text-foreground">Camera Type</View>
        <Select defaultValue="rtsp">
          <SelectTrigger>
            <SelectValue placeholder="Select camera type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rtsp">RTSP Stream</SelectItem>
            <SelectItem value="nvr">NVR (ONVIF)</SelectItem>
            <SelectItem value="usb">USB Camera</SelectItem>
          </SelectContent>
        </Select>
      </View>
      <View className="gap-2">
        <View className="text-sm font-medium text-foreground">Resolution</View>
        <Select defaultValue="1080p">
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p (HD)</SelectItem>
            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
            <SelectItem value="4k">4K (Ultra HD)</SelectItem>
          </SelectContent>
        </Select>
      </View>
    </View>
  ),
};






