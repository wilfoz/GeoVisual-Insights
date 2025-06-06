// detect-infrastructure.ts
'use server';

/**
 * @fileOverview Detects and classifies infrastructure in an image.
 *
 * - detectInfrastructure - A function that takes an image data URI and detects infrastructure.
 * - DetectInfrastructureInput - The input type for the detectInfrastructure function.
 * - DetectInfrastructureOutput - The return type for the detectInfrastructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectInfrastructureInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a keyframe from a video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectInfrastructureInput = z.infer<typeof DetectInfrastructureInputSchema>;

const DetectInfrastructureOutputSchema = z.object({
  infrastructureDetails: z.array(
    z.object({
      type: z.string().describe('The type of infrastructure detected (e.g., road, building, power line, railway).'),
      locationDescription: z.string().describe('A description of the location of the infrastructure in the image.'),
      proximityToGeoFeatures: z.string().optional().describe('The proximity of the infrastructure to other geographical features such as rivers, mountains, or forests.'),
    })
  ).describe('An array of detected infrastructure details including type, location, and proximity to geo features.'),
});

export type DetectInfrastructureOutput = z.infer<typeof DetectInfrastructureOutputSchema>;

export async function detectInfrastructure(input: DetectInfrastructureInput): Promise<DetectInfrastructureOutput> {
  return detectInfrastructureFlow(input);
}

const detectInfrastructurePrompt = ai.definePrompt({
  name: 'detectInfrastructurePrompt',
  input: {schema: DetectInfrastructureInputSchema},
  output: {schema: DetectInfrastructureOutputSchema},
  prompt: `You are an expert in analyzing aerial and satellite imagery to detect infrastructure.

  Analyze the provided image and identify all infrastructure present, classifying each by type (road, building, power line, railway, etc.). For each identified piece of infrastructure, provide a description of its location within the image.  If possible, comment on the proximity to other geographical features.

  Image: {{media url=photoDataUri}}
  `,
});

const detectInfrastructureFlow = ai.defineFlow(
  {
    name: 'detectInfrastructureFlow',
    inputSchema: DetectInfrastructureInputSchema,
    outputSchema: DetectInfrastructureOutputSchema,
  },
  async input => {
    const {output} = await detectInfrastructurePrompt(input);
    return output!;
  }
);
