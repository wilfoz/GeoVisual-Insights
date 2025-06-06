import { config } from 'dotenv';
config();

import '@/ai/flows/classify-soil.ts';
import '@/ai/flows/analyze-vegetation.ts';
import '@/ai/flows/analyze-proximity.ts';
import '@/ai/flows/detect-infrastructure.ts';