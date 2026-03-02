import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "ui";

const meta: Meta<typeof Card> = {
  title: "Molecules/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Camera Status</CardTitle>
        <CardDescription>Monitoring feed health across all locations.</CardDescription>
      </CardHeader>
      <CardContent>
        <View>
          <View>Last heartbeat: 2 minutes ago.</View>
        </View>
      </CardContent>
      <CardFooter>
        <CardAction>
          <Button size="sm">Restart</Button>
          <Button size="sm" variant="secondary">
            Details
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  ),
};









