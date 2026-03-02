import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider, Button, View, Text } from "ui";
import { useTheme } from "ui";

const meta: Meta = {
  title: "Templates/ThemeProvider",
};

export default meta;
type Story = StoryObj;

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-sm text-muted-foreground">Current: {theme}</Text>
      <Button variant="outline" size="sm" onPress={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle theme
      </Button>
    </View>
  );
};

export const ProviderDemo: Story = {
  render: () => (
    <ThemeProvider>
      <View className="rounded-lg border border-border p-6">
        <ThemeToggle />
      </View>
    </ThemeProvider>
  ),
};









