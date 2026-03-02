import type { Meta, StoryObj } from "@storybook/react";
import { Badge, Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "ui";

const meta: Meta<typeof Table> = {
  title: "Organisms/Table",
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

export const CameraTable: Story = {
  render: () => (
    <Table>
      <TableCaption>Connected cameras</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pipeline</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {["Lobby", "Warehouse Dock", "Parking Lot"].map((name, index) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <Badge variant={index === 1 ? "secondary" : "default"}>
                {index === 1 ? "Offline" : "Online"}
              </Badge>
            </TableCell>
            <TableCell>{index === 2 ? "Vehicle Safety" : "Perimeter"}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};














