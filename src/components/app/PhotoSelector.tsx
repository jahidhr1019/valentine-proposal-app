"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Heart } from 'lucide-react';

type PhotoSelectorProps = {
  onSubmit: (photos: ImagePlaceholder[]) => void;
};

export default function PhotoSelector({ onSubmit }: PhotoSelectorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePlaceholder[]>([]);

  const togglePhotoSelection = (photo: ImagePlaceholder) => {
    setSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [...prev, photo]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedPhotos);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl md:text-4xl">Share Your Memories</CardTitle>
        <CardDescription className="font-body text-lg">Select photos that tell your story. You can also skip this step.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {PlaceHolderImages.map((photo) => (
            <div
              key={photo.id}
              className="relative cursor-pointer group"
              onClick={() => togglePhotoSelection(photo)}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.description}
                width={300}
                height={200}
                className={`w-full h-auto object-cover rounded-lg transition-all duration-300 ${
                  selectedPhotos.some((p) => p.id === photo.id) ? 'ring-4 ring-primary' : 'ring-2 ring-transparent'
                }`}
                data-ai-hint={photo.imageHint}
              />
              {selectedPhotos.some((p) => p.id === photo.id) && (
                <div className="absolute inset-0 bg-primary/50 flex items-center justify-center rounded-lg">
                  <Heart className="w-12 h-12 text-white fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSubmit} size="lg" className="font-headline text-lg">
            Continue to Proposal
            <Heart className="ml-2 fill-current" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
