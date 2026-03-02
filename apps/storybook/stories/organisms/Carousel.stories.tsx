import type { Meta, StoryObj } from "@storybook/react";
import { Carousel, CarouselItem, Card, CardContent } from "ui";

const meta: Meta<typeof Carousel> = {
  title: "Organisms/Carousel",
  component: Carousel,
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const EvidenceCarousel: Story = {
  render: () => (
    <Carousel className="max-w-xl">
      {[1, 2, 3].map((item) => (
        <CarouselItem key={item}>
          <Card>
            <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
              Frame {item}
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </Carousel>
  ),
};














