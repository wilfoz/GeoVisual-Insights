
import type { AnalyzeVegetationOutput } from "@/ai/flows/analyze-vegetation";
import type { ClassifySoilOutput } from "@/ai/flows/classify-soil";
import type { DetectInfrastructureOutput } from "@/ai/flows/detect-infrastructure";
import type { AnalyzeProximityOutput } from "@/ai/flows/analyze-proximity";

export interface KeyFrame {
  id: string;
  url: string; 
  dataUri: string;
  description: string;
}

export interface GeospatialData {
  city: string;
  state: string;
  population: string;
  medianIncome: string;
  majorIndustries: string[];
}

export interface ClimateData {
  averagePrecipitation: string;
  dominantWindDirection: string;
  averageWindSpeed: string;
}

export interface AnalysisResults {
  vegetation?: AnalyzeVegetationOutput | null;
  soil?: ClassifySoilOutput | null;
  infrastructure?: DetectInfrastructureOutput | null;
  proximity?: AnalyzeProximityOutput | null;
}

export interface LoadingStates {
  vegetation?: boolean;
  soil?: boolean;
  infrastructure?: boolean;
  proximity?: boolean;
  geospatial?: boolean;
  climate?: boolean;
}

export interface ErrorStates {
  vegetation?: string | null;
  soil?: string | null;
  infrastructure?: string | null;
  proximity?: string | null;
  geospatial?: string | null;
  climate?: string | null;
}
