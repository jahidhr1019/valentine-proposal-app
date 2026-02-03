"use client";

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type PhotoRallyProps = {
  photos: ImagePlaceholder[];
  message: string;
};

export default function PhotoRally({ photos, message }: PhotoRallyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
      <h1 className="font-headline text-4xl md:text-6xl text-primary mb-4">She said Yes!</h1>
      <p className="font-body text-lg md:text-xl text-foreground/80 mb-8">Celebrating your love story.</p>
      
      {photos.length > 0 ? (
        <Carousel className="w-full max-w-xl">
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="relative aspect-video flex items-center justify-center p-0">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.description}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-6">
                      <p className="font-headline text-2xl md:text-3xl text-white text-center shadow-lg">{message}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
         <Card className="w-full max-w-xl">
            <CardContent className="relative aspect-video flex items-center justify-center p-6 bg-secondary rounded-lg">
                 <p className="font-headline text-2xl md:text-3xl text-secondary-foreground text-center">{message}</p>
            </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="font-headline text-3xl text-primary">Congratulations!</h2>
        <p className="font-body text-foreground/80 mt-2">Wishing you a lifetime of love and happiness.</p>
      </div>
    </div>
  );
}
