// 'use server';
/**
 * @fileOverview Vegetation analysis AI agent.
 *
 * Note: Providing high-resolution imagery as input is crucial for improving the accuracy of vegetation analysis.
 *
 * - analyzeVegetation - A function that handles the vegetation analysis process.
 * - AnalyzeVegetationInput - The input type for the analyzeVegetation function.
 * - AnalyzeVegetationOutput - The return type for the analyzeVegetation function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVegetationInputSchema = z.object({
  photoDataUris: z
 .array(z.string())
    .describe(
      "High-resolution photos of the vegetation, as data URIs. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The location of the vegetation.'),
 geospatialContext: z.string().optional().describe('Geospatial context for the analysis, potentially including GeoJSON or other relevant data.'),
});
export type AnalyzeVegetationInput = z.infer<typeof AnalyzeVegetationInputSchema>;

const AnalyzeVegetationOutputSchema = z.object({
  vegetationType: z.string().describe('The type of vegetation present.'),
  vegetationDensity: z.string().describe('The density of the vegetation (e.g., sparse, medium, dense).'),
  healthAssessment: z.string().describe('An assessment of the vegetation health.'),
  confidence: z.number().describe('Confidence level of the vegetation analysis (0-1).'),
  reasoning: z.string().describe('Reasoning behind the vegetation analysis and confidence level.'),
});
export type AnalyzeVegetationOutput = z.infer<typeof AnalyzeVegetationOutputSchema>;

export async function analyzeVegetation(input: AnalyzeVegetationInput): Promise<AnalyzeVegetationOutput> {
  return analyzeVegetationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVegetationPrompt',
  input: {schema: AnalyzeVegetationInputSchema},
  output: {schema: AnalyzeVegetationOutputSchema},
  prompt: `You are an expert in vegetation analysis. Analyze the provided images, location, and geospatial context to determine the vegetation type, density, and overall health. Provide a confidence score for your analysis and explain your reasoning, noting any uncertainties.

Location: {{{location}}}
Geospatial Context: {{{geospatialContext}}}
Images: {{#each photoDataUris}}
{{media url=this}}
{{/each}}

<CODE_BLOCK>
Thought:
1. Analyze each image to identify vegetation features.
2. Consider the location and geospatial context to refine vegetation classification and density assessment.
3. Evaluate vegetation health based on visual cues and contextual information.
4. Synthesize the findings to provide a comprehensive analysis.
</CODE_BLOCK>

Example Input:
Location: Amazonas, Brazil
Geospatial Context: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-60,-3],[-59,-3],[-59,-4],[-60,-4],[-60,-3]]]}}]}
Images: [Image of dense forest, Image of riverbank vegetation]

Example Output:
<CODE_BLOCK>
Thought:
1. Images show dense tree cover and riparian vegetation.
2. Location in the Amazon basin and geospatial context confirm a tropical rainforest environment.
3. Vegetation appears lush and healthy in both images.
4. Based on the analysis, the vegetation type is tropical rainforest, density is dense, and health is good. Confidence is high as visual cues are clear and consistent with the location.
5. Outputting the analysis with confidence and reasoning.
</CODE_BLOCK>
{
  "vegetationType": "Tropical Rainforest",
  "vegetationDensity": "dense",
  "healthAssessment": "Good",
  "confidence": 0.95,
  "reasoning": "The images clearly depict dense tree cover and riparian vegetation characteristic of a tropical rainforest. The location and geospatial context in the Amazon basin further support this classification. The vegetation appears healthy with no visible signs of stress or disease."
}
`,
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
