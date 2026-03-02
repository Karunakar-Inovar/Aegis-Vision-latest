import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  View,
  Text,
} from "ui";

const meta: Meta<typeof Sheet> = {
  title: "Organisms/Sheet",
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const FiltersPanel: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open panel</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Adjust which alerts appear on the dashboard.</SheetDescription>
        </SheetHeader>
        <View className="flex-1 justify-center">
          <Text className="text-sm text-muted-foreground">Filter inputs go here.</Text>
        </View>
        <SheetFooter>
          <Button variant="ghost">Reset</Button>
          <Button>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};









