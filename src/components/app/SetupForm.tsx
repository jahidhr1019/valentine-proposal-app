"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Heart } from 'lucide-react';
import type { UserData } from '@/lib/types';

const formSchema = z.object({
  yourName: z.string().min(1, { message: "Please enter your name." }),
  partnerName: z.string().min(1, { message: "Please enter your partner's name." }),
  message: z.string().min(5, { message: "Message must be at least 5 characters." }).max(100, { message: "Message cannot exceed 100 characters." }),
});

type SetupFormProps = {
  onSubmit: (data: UserData) => void;
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

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Card className="w-full max-w-lg mx-auto animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl md:text-4xl">Eternal Echo</CardTitle>
        <CardDescription className="font-body text-lg">Craft your perfect proposal</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6">
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-headline text-lg" size="lg">
              Begin the Journey
              <Heart className="ml-2 fill-current" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
