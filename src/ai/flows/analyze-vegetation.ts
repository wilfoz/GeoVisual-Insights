// 'use server';
/**
 * @fileOverview Vegetation analysis AI agent.
 *
 * - analyzeVegetation - A function that handles the vegetation analysis process.
 * - AnalyzeVegetationInput - The input type for the analyzeVegetation function.
 * - AnalyzeVegetationOutput - The return type for the analyzeVegetation function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVegetationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the vegetation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The location of the vegetation.'),
});
export type AnalyzeVegetationInput = z.infer<typeof AnalyzeVegetationInputSchema>;

const AnalyzeVegetationOutputSchema = z.object({
  vegetationType: z.string().describe('The type of vegetation present.'),
  vegetationDensity: z.string().describe('The density of the vegetation (e.g., sparse, medium, dense).'),
  healthAssessment: z.string().describe('An assessment of the vegetation health.'),
});
export type AnalyzeVegetationOutput = z.infer<typeof AnalyzeVegetationOutputSchema>;

export async function analyzeVegetation(input: AnalyzeVegetationInput): Promise<AnalyzeVegetationOutput> {
  return analyzeVegetationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVegetationPrompt',
  input: {schema: AnalyzeVegetationInputSchema},
  output: {schema: AnalyzeVegetationOutputSchema},
  prompt: `You are an expert in vegetation analysis. Analyze the provided image and location to determine the vegetation type, density, and overall health.\n\nLocation: {{{location}}}\nImage: {{media url=photoDataUri}}\n\nProvide the vegetation type, vegetation density (sparse, medium, or dense), and an overall health assessment of the vegetation.\n`,
});

const analyzeVegetationFlow = ai.defineFlow(
  {
    name: 'analyzeVegetationFlow',
    inputSchema: AnalyzeVegetationInputSchema,
    outputSchema: AnalyzeVegetationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
