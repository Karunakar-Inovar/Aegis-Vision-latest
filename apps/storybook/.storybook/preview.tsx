import React from "react";
import type { Preview } from "@storybook/react-vite";
import "../styles/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "hsl(0 0% 100%)" },
        { name: "dark", value: "hsl(222.2 84% 4.9%)" },
      ],
    },
  },
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme === "dark" ? "dark" : ""}>
        <div id="storybook-root" className="p-6">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
