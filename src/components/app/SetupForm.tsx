"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Plus } from 'lucide-react';
import type { UserData } from '@/lib/types';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

const formSchema = z.object({
  yourName: z.string().min(1, { message: "Please enter your name." }),
  partnerName: z.string().min(1, { message: "Please enter your partner's name." }),
  message: z.string().min(5, { message: "Message must be at least 5 characters." }).max(100, { message: "Message cannot exceed 100 characters." }),
});

type SetupFormProps = {
  onSubmit: (data: UserData, photos: ImagePlaceholder[]) => void;
};

export default function SetupForm({ onSubmit }: SetupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yourName: '',
      partnerName: '',
      message: 'Forever and always.',
    },
  });

  const [availablePhotos, setAvailablePhotos] = useState<ImagePlaceholder[]>(PlaceHolderImages);
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePlaceholder[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newPhoto: ImagePlaceholder = {
          id: `user-photo-${Date.now()}`,
          description: file.name,
          imageUrl,
          imageHint: 'custom photo'
        };
        setAvailablePhotos((prev) => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePhotoSelection = (photo: ImagePlaceholder) => {
    setSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [...prev, photo]
    );
  };

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values, selectedPhotos);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl md:text-4xl">Eternal Echo</CardTitle>
        <CardDescription className="font-body text-lg">Craft your perfect proposal</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="yourName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg">Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partnerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg">Partner's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jordan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline text-lg">A Special Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This message will appear with your photos..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="font-headline text-lg">Share Your Memories</FormLabel>
              <p className="text-sm text-muted-foreground mb-4">Select photos that tell your story. You can also upload your own.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div
                  className="relative aspect-video cursor-pointer group border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center text-muted-foreground">
                    <Plus className="mx-auto h-8 w-8" />
                    <p>Upload Photo</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                {availablePhotos.map((photo) => (
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
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-headline text-lg" size="lg">
              Continue to Proposal
              <Heart className="ml-2 fill-current" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
