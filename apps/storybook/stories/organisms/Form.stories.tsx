import type { Meta, StoryObj } from "@storybook/react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Button } from "ui";
import { useForm } from "react-hook-form";

const meta: Meta = {
  title: "Organisms/Form",
};

export default meta;
type Story = StoryObj;

export const ReactHookFormExample: Story = {
  render: () => {
    const form = useForm<{ name: string }>({
      defaultValues: { name: "" },
    });

    const onSubmit = form.handleSubmit((values) => {
      alert(JSON.stringify(values, null, 2));
    });

    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipeline name</FormLabel>
                <FormControl>
                  <Input placeholder="Night shift alerts" {...field} />
                </FormControl>
                <FormDescription>This appears on dashboards and notifications.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    );
  },
};














