'use server';

/**
 * @fileOverview Implements the logic for the evasive 'No' button in the proposal application.
 *
 * This file defines a Genkit flow that determines the next position of the 'No' button
 * based on the user's cursor position, screen boundaries, and previous teleport history.
 *
 * @interface EvasiveNoButtonInput - Input parameters for the evasive No button flow, including cursor
 *   position, screen dimensions, and recent button positions.
 * @interface EvasiveNoButtonOutput - Output of the flow, providing the next x and y coordinates for the
 *   'No' button's new location.
 *
 * @function getEvasiveNoButtonPosition - The main function to call to get the new position of the No button.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvasiveNoButtonInputSchema = z.object({
  cursorX: z.number().describe('The current X coordinate of the user\'s cursor.'),
  cursorY: z.number().describe('The current Y coordinate of the user\'s cursor.'),
  screenWidth: z.number().describe('The width of the screen.'),
  screenHeight: z.number().describe('The height of the screen.'),
  previousPositions: z
    .array(z.object({x: z.number(), y: z.number()}))
    .describe('An array of the previous X and Y coordinates of the button.'),
  recentDecisions: z
    .array(z.boolean())
    .describe('An array representing recent decisions, true for yes, false for no'),
});
export type EvasiveNoButtonInput = z.infer<typeof EvasiveNoButtonInputSchema>;

const EvasiveNoButtonOutputSchema = z.object({
  x: z.number().describe('The new X coordinate for the button.'),
  y: z.number().describe('The new Y coordinate for the button.'),
});
export type EvasiveNoButtonOutput = z.infer<typeof EvasiveNoButtonOutputSchema>;

export async function getEvasiveNoButtonPosition(
  input: EvasiveNoButtonInput
): Promise<EvasiveNoButtonOutput> {
  return evasiveNoButtonFlow(input);
}

const evasiveNoButtonPrompt = ai.definePrompt({
  name: 'evasiveNoButtonPrompt',
  input: {schema: EvasiveNoButtonInputSchema},
  output: {schema: EvasiveNoButtonOutputSchema},
  prompt: `You are an AI that controls the movement of a "No" button on a screen.

  The user is trying to click the "Yes" button, but you need to make it challenging for them by intelligently moving the "No" button.

  Your goal is to make the "No" button evade the user's clicks, but avoid frustrating them too much.

  Here's some information to help you decide where to move the button:

  - The user's cursor is currently at ({{cursorX}}, {{cursorY}}).
  - The screen size is {{screenWidth}}x{{screenHeight}}.
  - The button's previous positions were: {{#each previousPositions}}({{x}}, {{y}}) {{/each}}
  - Recent decisions: {{#each recentDecisions}}{{#if this}}Yes{{else}}No{{/if}} {{/each}}

  Based on this information, suggest the next position (x, y) for the "No" button.  The x and y coordinates must be within the screen boundaries.
  The new position should be far enough from the cursor to avoid an immediate click, but not so far that it becomes frustrating.
  Take into account the recent decisions, if there are too many "No" decisions in a row, make it easier for the user to click the Yes button by not moving the No button too far away.
  Do not move the button to a position where it has been recently.

  Return the next position as a JSON object with "x" and "y" coordinates.`,
});

const evasiveNoButtonFlow = ai.defineFlow(
  {
    name: 'evasiveNoButtonFlow',
    inputSchema: EvasiveNoButtonInputSchema,
    outputSchema: EvasiveNoButtonOutputSchema,
  },
  async input => {
    const {output} = await evasiveNoButtonPrompt(input);
    return output!;
  }
);
