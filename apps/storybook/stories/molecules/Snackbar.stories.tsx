import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { useState } from "react";
import { Snackbar, useSnackbar, Button } from "ui";

const meta: Meta<typeof Snackbar> = {
  title: "Molecules/Snackbar",
  component: Snackbar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

// Wrapper component to demonstrate snackbar
const SnackbarDemo = ({
  variant,
  message,
  position,
  actionText,
}: {
  variant?: "default" | "success" | "error" | "warning" | "info";
  message: string;
  position?: "top" | "bottom";
  actionText?: string;
}) => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ height: 300, width: "100%", position: "relative", backgroundColor: "#f9fafb" }}>
      <View style={{ padding: 20, alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Button onPress={() => setVisible(true)}>Show Snackbar</Button>
      </View>
      <Snackbar
        visible={visible}
        message={message}
        variant={variant}
        position={position}
        actionText={actionText}
        onAction={() => console.log("Action clicked")}
        onClose={() => setVisible(false)}
        duration={0} // Disable auto-dismiss for demo
      />
    </View>
  );
};

export const Default: Story = {
  render: () => <SnackbarDemo message="This is a default snackbar message" />,
};

export const Success: Story = {
  render: () => (
    <SnackbarDemo variant="success" message="Changes saved successfully!" />
  ),
};

export const Error: Story = {
  render: () => (
    <SnackbarDemo variant="error" message="Something went wrong. Please try again." />
  ),
};

export const Warning: Story = {
  render: () => (
    <SnackbarDemo variant="warning" message="Your session will expire in 5 minutes." />
  ),
};

export const Info: Story = {
  render: () => (
    <SnackbarDemo variant="info" message="New updates are available for download." />
  ),
};

export const TopPosition: Story = {
  render: () => (
    <SnackbarDemo
      variant="info"
      message="This snackbar appears at the top"
      position="top"
    />
  ),
};

export const WithAction: Story = {
  render: () => (
    <SnackbarDemo
      variant="default"
      message="Item deleted from your list"
      actionText="Undo"
    />
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => {
    const [activeVariant, setActiveVariant] = useState<
      "default" | "success" | "error" | "warning" | "info" | null
    >(null);

    const variants = [
      { key: "default", label: "Default", message: "This is a default message" },
      { key: "success", label: "Success", message: "Operation completed successfully!" },
      { key: "error", label: "Error", message: "An error occurred. Please try again." },
      { key: "warning", label: "Warning", message: "Please review before continuing." },
      { key: "info", label: "Info", message: "Here's some useful information." },
    ] as const;

    return (
      <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f9fafb" }}>
        <View style={{ padding: 20, gap: 12 }}>
          {variants.map((v) => (
            <Button
              key={v.key}
              onPress={() => setActiveVariant(v.key)}
              variant={activeVariant === v.key ? "default" : "outline"}
            >
              {v.label}
            </Button>
          ))}
        </View>
        {activeVariant && (
          <Snackbar
            visible={true}
            message={variants.find((v) => v.key === activeVariant)?.message || ""}
            variant={activeVariant}
            onClose={() => setActiveVariant(null)}
            duration={0}
          />
        )}
      </View>
    );
  },
};

// useSnackbar hook demo
export const WithHook: Story = {
  render: () => {
    const snackbar = useSnackbar();

    return (
      <View style={{ height: 400, width: "100%", position: "relative", backgroundColor: "#f9fafb" }}>
        <View style={{ padding: 20, gap: 12 }}>
          <Button onPress={() => snackbar.success("File uploaded successfully!")}>
            Show Success
          </Button>
          <Button onPress={() => snackbar.error("Failed to save changes")}>
            Show Error
          </Button>
          <Button onPress={() => snackbar.warning("Low storage space")}>
            Show Warning
          </Button>
          <Button
            onPress={() =>
              snackbar.info("New feature available!", {
                actionText: "Learn More",
                onAction: () => console.log("Learn more clicked"),
              })
            }
          >
            Show Info with Action
          </Button>
        </View>
        <Snackbar
          visible={snackbar.state.visible}
          message={snackbar.state.message}
          variant={snackbar.state.variant}
          actionText={snackbar.state.actionText}
          onAction={snackbar.state.onAction}
          onClose={snackbar.hide}
        />
      </View>
    );
  },
};






