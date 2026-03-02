import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger, View } from "ui";

const meta: Meta<typeof Tabs> = {
  title: "Organisms/Tabs",
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const NotificationTabs: Story = {
  render: () => (
    <Tabs defaultValue="global" className="w-full max-w-2xl">
      <TabsList>
        <TabsTrigger value="global">Global</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="custom">Custom</TabsTrigger>
      </TabsList>
      <TabsContent value="global">
        <View className="rounded-md border border-border p-4">
          Global notification defaults apply to every camera unless overridden.
        </View>
      </TabsContent>
      <TabsContent value="pipeline">
        <View className="rounded-md border border-border p-4">
          Configure different alerting rules by pipeline type.
        </View>
      </TabsContent>
      <TabsContent value="custom">
        <View className="rounded-md border border-border p-4">
          Fine tune using recipients, quiet hours, or severity thresholds.
        </View>
      </TabsContent>
    </Tabs>
  ),
};









