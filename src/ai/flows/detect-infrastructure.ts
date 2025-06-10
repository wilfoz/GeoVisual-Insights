// Important: Providing high-resolution imagery is crucial for accurate infrastructure detection.

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
  photoDataUri: z.array(
 z.string()
    .describe(
 "An array of photos of a keyframe from a video, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
 )
 ),
  geospatialContext: z.string().optional().describe('Geospatial context for the analysis, potentially including GeoJSON or other relevant data.'),
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
  confidence: z.number().describe('Overall confidence level of the infrastructure detection (0-1).'),
  reasoning: z.string().describe('Overall reasoning behind the infrastructure detection and confidence level, including any uncertainties.'),
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

  Analyze the provided images and geospatial context to identify all infrastructure present, classifying each by type (road, building, power line, railway, etc.). For each identified piece of infrastructure, provide a description of its location within the images and in relation to the geospatial context. If possible, comment on the proximity to other geographical features.
 
  Images: {{#each photoDataUri}}{{media url=this}}\n{{/each}}

  Geospatial Context: {{{geospatialContext}}}

<CODE_BLOCK>
Thought:
1. Analyze each image to identify potential infrastructure elements.
2. Use geospatial context to help identify and classify infrastructure based on location and known patterns.
3. Determine the type of each detected infrastructure.
4. Describe the location of each infrastructure element within the images and relative to the geospatial context.
5. Assess the proximity of infrastructure to geographical features based on the images and geospatial context.
6. Compile the findings into the specified output format.
7. Determine an overall confidence score for the detection and explain the reasoning, including any ambiguities or limitations in the data.

</CODE_BLOCK>

Example Input:
Images: [Image of a road, Image of a building complex]
Geospatial Context: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-74,40],[-73,41]]}}]}

Example Output:
<CODE_BLOCK>
Thought:
1. The first image clearly shows a paved road. The second image shows multiple connected structures, likely a building complex.
2. The geospatial context shows a line string, which could represent a road or other linear feature, aligning with the first image.
3. Identified infrastructure types are road and building.
4. The road appears to be a major road running through a developed area. The building complex is located adjacent to the road.
5. Based on the images and geospatial context, the road appears to be near a forested area in one section.
6. Outputting the details in the specified JSON format.
</CODE_BLOCK>
{
  "confidence": 0.95,
{
  "infrastructureDetails": [
    { "type": "road", "locationDescription": "A paved road running through the area, visible in the first image and potentially represented by the line string in the geospatial context.", "proximityToGeoFeatures": "Appears to be near a forested area in some parts." },
    { "type": "building complex", "locationDescription": "A group of connected buildings located adjacent to the road, visible in the second image.", "proximityToGeoFeatures": "Not directly adjacent to major geographical features based on the provided images and context." }
  ]
}
  "reasoning": "Infrastructure types (road, building complex) were clearly identifiable in the high-resolution images. The geospatial context provided some supporting information for the road location. There were no significant ambiguities in the visual data or conflicts with the context."
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
