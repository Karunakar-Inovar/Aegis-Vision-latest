import * as React from "react";
import useEmblaCarousel, { type EmblaOptionsType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../atoms/button";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: EmblaOptionsType;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, options, ...props }, ref) => {
    const [viewportRef, api] = useEmblaCarousel(options);

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div ref={viewportRef} className="overflow-hidden">
          <div className="flex">{children}</div>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("min-w-0 flex-[0_0_100%] pl-4", className)} {...props} />
  )
);
CarouselItem.displayName = "CarouselItem";

export { Carousel, CarouselItem };














