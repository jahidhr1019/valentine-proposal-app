'use server';
/**
 * @fileOverview A flow to generate a sweet caption for an image.
 *
 * - generateCaption - A function that handles caption generation.
 * - GenerateCaptionInput - The input type for the generateCaption function.
 * - GenerateCaptionOutput - The return type for the generateCaption function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a romantic moment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateCaptionInput = z.infer<typeof GenerateCaptionInputSchema>;

const GenerateCaptionOutputSchema = z.object({
  caption: z.string().describe('A unique and sweet caption for the photo.'),
});
export type GenerateCaptionOutput = z.infer<typeof GenerateCaptionOutputSchema>;

export async function generateCaption(input: GenerateCaptionInput): Promise<GenerateCaptionOutput> {
  return generateCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionPrompt',
  input: { schema: GenerateCaptionInputSchema },
  output: { schema: GenerateCaptionOutputSchema },
  prompt: `You are a romantic poet. Your task is to write a short, sweet, unique, and heartfelt caption for the provided image. The caption should be a single, beautiful sentence that captures the emotion of the moment.

  Photo: {{media url=photoDataUri}}`,
});

const generateCaptionFlow = ai.defineFlow(
  {
    name: 'generateCaptionFlow',
    inputSchema: GenerateCaptionInputSchema,
    outputSchema: GenerateCaptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
