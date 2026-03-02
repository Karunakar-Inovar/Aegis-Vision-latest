import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "ui";

const meta: Meta<typeof Accordion> = {
  title: "Organisms/Accordion",
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const SetupSummary: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="organization">
        <AccordionTrigger>Organization</AccordionTrigger>
        <AccordionContent>Acme Retail (3 locations)</AccordionContent>
      </AccordionItem>
      <AccordionItem value="cameras">
        <AccordionTrigger>Cameras</AccordionTrigger>
        <AccordionContent>12 cameras configured • 2 offline</AccordionContent>
      </AccordionItem>
      <AccordionItem value="pipelines">
        <AccordionTrigger>Pipelines</AccordionTrigger>
        <AccordionContent>5 alerting pipelines enabled</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};














