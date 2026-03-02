import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Icon, Button, View, Text } from "ui";
import {
  Eye,
  Camera,
  WebcamIcon,
  Bell,
  Settings,
  Users,
  BarChart,
  Check,
  X,
  ChevronDown,
  Search,
  Download,
  Play,
  Maximize2,
  GitBranch,
  Shield,
  Clock,
  Wifi,
  Database,
  Network,
  Loader2,
  AlertTriangle,
  Film,
  List,
  Power,
  EyeOff,
  Building,
  Fingerprint,
  History,
  FileDown,
  HelpCircle,
  RefreshCw,
  Video,
  Activity,
} from "ui";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "number", min: 12, max: 48, step: 2 },
      description: "Icon size in pixels",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    icon: Eye,
    size: 24,
  },
};

export const Sizes: Story = {
  render: () => (
    <View className="flex-row items-center gap-4">
      <Icon icon={Eye} size={16} />
      <Icon icon={Eye} size={20} />
      <Icon icon={Eye} size={24} />
      <Icon icon={Eye} size={32} />
      <Icon icon={Eye} size={40} />
    </View>
  ),
};

export const WithColors: Story = {
  render: () => (
    <View className="flex-row items-center gap-4">
      <Icon icon={Check} size={24} className="text-green-600" />
      <Icon icon={X} size={24} className="text-red-600" />
      <Icon icon={Bell} size={24} className="text-blue-600" />
      <Icon icon={Settings} size={24} className="text-gray-600" />
      <Icon icon={Eye} size={24} className="text-primary" />
    </View>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <View className="flex-row flex-wrap gap-4">
      {[
        { icon: Eye, label: "Eye" },
        { icon: Camera, label: "Camera" },
        { icon: WebcamIcon, label: "Webcam" },
        { icon: Bell, label: "Bell" },
        { icon: Settings, label: "Settings" },
        { icon: Users, label: "Users" },
        { icon: BarChart, label: "BarChart" },
        { icon: Check, label: "Check" },
        { icon: X, label: "X" },
        { icon: ChevronDown, label: "ChevronDown" },
        { icon: Search, label: "Search" },
        { icon: Download, label: "Download" },
        { icon: Play, label: "Play" },
        { icon: Maximize2, label: "Maximize" },
        { icon: GitBranch, label: "GitBranch" },
        { icon: Shield, label: "Shield" },
        { icon: Clock, label: "Clock" },
      ].map(({ icon, label }) => (
        <View key={label} className="w-1/2 flex-col items-center gap-2 rounded border p-4">
          <Icon icon={icon} size={24} />
          <Text className="text-xs text-muted-foreground">{label}</Text>
        </View>
      ))}
    </View>
  ),
};

export const InButtons: Story = {
  render: () => (
    <View className="flex-row gap-2">
      <Button className="flex-row items-center gap-2" onPress={() => {}}>
        <Icon icon={Download} size={16} />
        <Text>Download</Text>
      </Button>
      <Button variant="outline" className="flex-row items-center gap-2" onPress={() => {}}>
        <Icon icon={Search} size={16} />
        <Text>Search</Text>
      </Button>
      <Button variant="outline" className="flex-row items-center gap-2" onPress={() => {}}>
        <Icon icon={Settings} size={16} />
        <Text>Settings</Text>
      </Button>
    </View>
  ),
};

const IconSection = ({
  title,
  items,
}: {
  title: string;
  items: { icon: React.ComponentType<any>; label: string }[];
}) => (
  <View className="gap-4">
    <Text className="text-sm font-semibold">{title}</Text>
    <View className="flex-row flex-wrap gap-4">
      {items.map(({ icon, label }) => (
        <View key={label} className="w-1/2 flex-col items-center gap-2 rounded border p-4">
          <Icon icon={icon} size={24} />
          <Text className="text-xs text-muted-foreground">{label}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const IconGallery: Story = {
  render: () => (
    <View className="gap-8">
      <IconSection
        title="Status & Connection"
        items={[
          { icon: Wifi, label: "Wifi" },
          { icon: Network, label: "Network" },
          { icon: Database, label: "Database" },
          { icon: Activity, label: "Activity" },
        ]}
      />
      <IconSection
        title="Alerts & Incidents"
        items={[
          { icon: AlertTriangle, label: "Alert" },
          { icon: Bell, label: "Bell" },
          { icon: Shield, label: "Shield" },
        ]}
      />
      <IconSection
        title="Media & Evidence"
        items={[
          { icon: Film, label: "Film" },
          { icon: Camera, label: "Camera" },
          { icon: Video, label: "Video" },
        ]}
      />
      <IconSection
        title="Actions & Operations"
        items={[
          { icon: Power, label: "Power" },
          { icon: RefreshCw, label: "Refresh" },
          { icon: Loader2, label: "Loading" },
        ]}
      />
    </View>
  ),
};

