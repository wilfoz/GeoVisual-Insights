
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ResultsDisplay, InfrastructureResultsDisplay } from "@/components/dashboard/results-display";

import { analyzeVegetation, type AnalyzeVegetationInput, type AnalyzeVegetationOutput } from "@/ai/flows/analyze-vegetation";
import { classifySoil, type ClassifySoilInput, type ClassifySoilOutput } from "@/ai/flows/classify-soil";
import { detectInfrastructure, type DetectInfrastructureInput, type DetectInfrastructureOutput } from "@/ai/flows/detect-infrastructure";
import { analyzeProximity, type AnalyzeProximityInput, type AnalyzeProximityOutput } from "@/ai/flows/analyze-proximity";

import type { KeyFrame, GeospatialData, ClimateData, AnalysisResults, LoadingStates, ErrorStates } from "@/types";

import { Leaf, Layers, Waves, Building2, Route, Zap, TrainTrack, LocateFixed, MapPin, Users, Landmark, CloudRain, Wind, FileText, UploadCloud, AlertCircle, Scissors, CheckCircle2 } from "lucide-react";

// Mock 1x1 transparent PNG data URI
const MOCK_IMAGE_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";


export default function DashboardPage() {
  const { toast } = useToast();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [keyframes, setKeyframes] = useState<KeyFrame[]>([]);
  const [selectedKeyframe, setSelectedKeyframe] = useState<KeyFrame | null>(null);
  
  const [locationContext, setLocationContext] = useState<string>("");
  const [geospatialCity, setGeospatialCity] = useState<string>("");
  const [geospatialState, setGeospatialState] = useState<string>("");

  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({});
  const [geospatialData, setGeospatialData] = useState<GeospatialData | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [errorStates, setErrorStates] = useState<ErrorStates>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      toast({ title: "File Selected", description: file.name });
      // Mock keyframe extraction
      const mockKeyframes: KeyFrame[] = Array.from({ length: 3 }, (_, i) => ({
        id: `kf-${i + 1}`,
        url: `https://placehold.co/320x180.png?random=${Math.random()}`, // Visual placeholder
        dataUri: MOCK_IMAGE_DATA_URI, // Data URI for AI flows
        description: `Keyframe ${i + 1}`,
      }));
      setKeyframes(mockKeyframes);
      setSelectedKeyframe(mockKeyframes[0] || null);
    }
  };

  const runVegetationAnalysis = useCallback(async () => {
    if (!selectedKeyframe?.dataUri || !locationContext) {
      toast({ title: "Input Missing", description: "Please select a keyframe and provide location context.", variant: "destructive" });
      return;
    }
    setLoadingStates(prev => ({ ...prev, vegetation: true }));
    setErrorStates(prev => ({ ...prev, vegetation: null }));
    try {
      const input: AnalyzeVegetationInput = { photoDataUri: selectedKeyframe.dataUri, location: locationContext };
      const result = await analyzeVegetation(input);
      setAnalysisResults(prev => ({ ...prev, vegetation: result }));
      toast({ title: "Vegetation Analysis Complete" });
    } catch (error) {
      console.error("Vegetation Analysis Error:", error);
      setErrorStates(prev => ({ ...prev, vegetation: (error as Error).message || "Failed to analyze vegetation." }));
      toast({ title: "Error", description: "Vegetation analysis failed.", variant: "destructive" });
    } finally {
      setLoadingStates(prev => ({ ...prev, vegetation: false }));
    }
  }, [selectedKeyframe, locationContext, toast]);

  const runSoilAssessment = useCallback(async () => {
    if (!selectedKeyframe?.dataUri || !locationContext) {
      toast({ title: "Input Missing", description: "Please select a keyframe and provide location context.", variant: "destructive" });
      return;
    }
    setLoadingStates(prev => ({ ...prev, soil: true }));
    setErrorStates(prev => ({ ...prev, soil: null }));
    try {
      const input: ClassifySoilInput = { photoDataUri: selectedKeyframe.dataUri, locationContext };
      const result = await classifySoil(input);
      setAnalysisResults(prev => ({ ...prev, soil: result }));
      toast({ title: "Soil Assessment Complete" });
    } catch (error) {
      console.error("Soil Assessment Error:", error);
      setErrorStates(prev => ({ ...prev, soil: (error as Error).message || "Failed to assess soil." }));
      toast({ title: "Error", description: "Soil assessment failed.", variant: "destructive" });
    } finally {
      setLoadingStates(prev => ({ ...prev, soil: false }));
    }
  }, [selectedKeyframe, locationContext, toast]);

  const runInfrastructureDetection = useCallback(async () => {
    if (!selectedKeyframe?.dataUri) {
      toast({ title: "Input Missing", description: "Please select a keyframe.", variant: "destructive" });
      return;
    }
    setLoadingStates(prev => ({ ...prev, infrastructure: true, proximity: true })); // Proximity depends on this
    setErrorStates(prev => ({ ...prev, infrastructure: null, proximity: null }));
    try {
      const infraInput: DetectInfrastructureInput = { photoDataUri: selectedKeyframe.dataUri };
      const infraResult = await detectInfrastructure(infraInput);
      setAnalysisResults(prev => ({ ...prev, infrastructure: infraResult }));
      toast({ title: "Infrastructure Detection Complete" });

      // Now run proximity analysis
      if (infraResult?.infrastructureDetails && analysisResults.soil) {
        const infraDesc = infraResult.infrastructureDetails.map(d => `${d.type} (${d.locationDescription})`).join(', ') || "No specific infrastructure detected.";
        const geoFeaturesDesc = `Soil: ${analysisResults.soil.soilType}. Surface Water: ${analysisResults.soil.surfaceWater ? 'Present' : 'Not present'}. Context: ${locationContext}`;
        
        const proximityInput: AnalyzeProximityInput = {
          infrastructure: infraDesc,
          geographicalFeatures: geoFeaturesDesc,
        };
        const proximityResult = await analyzeProximity(proximityInput);
        setAnalysisResults(prev => ({ ...prev, proximity: proximityResult }));
        toast({ title: "Proximity Analysis Complete" });
      } else {
         setErrorStates(prev => ({ ...prev, proximity: "Cannot run proximity analysis without infrastructure and soil data." }));
      }

    } catch (error) {
      console.error("Infrastructure/Proximity Error:", error);
      const errorMessage = (error as Error).message || "Failed to detect infrastructure or analyze proximity.";
      setErrorStates(prev => ({ ...prev, infrastructure: errorMessage, proximity: errorMessage }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoadingStates(prev => ({ ...prev, infrastructure: false, proximity: false }));
    }
  }, [selectedKeyframe, analysisResults.soil, locationContext, toast]);
  
  const fetchGeospatialData = useCallback(async () => {
    if (!geospatialCity || !geospatialState) {
      toast({ title: "Input Missing", description: "Please provide city and state for geospatial data.", variant: "destructive" });
      return;
    }
    setLoadingStates(prev => ({ ...prev, geospatial: true }));
    setErrorStates(prev => ({ ...prev, geospatial: null }));
    // Mock data fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGeospatialData({
      city: geospatialCity,
      state: geospatialState,
      population: `${Math.floor(Math.random() * 1000000)}`,
      medianIncome: `$${Math.floor(Math.random() * 50000) + 30000}`,
      majorIndustries: ["Agriculture", "Technology", "Tourism"].sort(() => 0.5 - Math.random()).slice(0,2),
    });
    setLoadingStates(prev => ({ ...prev, geospatial: false }));
    toast({ title: "Geospatial Data Fetched" });
  }, [geospatialCity, geospatialState, toast]);

  // Mock climate data on component mount or when location context changes minimally
   useEffect(() => {
    if(locationContext) { // Trigger if location context is available
        setLoadingStates(prev => ({ ...prev, climate: true }));
        setTimeout(() => { // Simulate API call
            setClimateData({
                averagePrecipitation: `${Math.floor(Math.random() * 50) + 10} inches/year`,
                dominantWindDirection: ["NW", "SE", "W"][Math.floor(Math.random() * 3)],
                averageWindSpeed: `${Math.floor(Math.random() * 10) + 5} mph`,
            });
            setLoadingStates(prev => ({ ...prev, climate: false }));
        }, 1200);
    }
  }, [locationContext]);


  const runAllAnalyses = () => {
    runVegetationAnalysis();
    runSoilAssessment();
    runInfrastructureDetection(); // This will also trigger proximity if soil data is ready
  };
  
  const generatePdfReport = () => {
    toast({ title: "PDF Report", description: "PDF generation initiated (mock)." });
    // Placeholder for PDF generation logic
    window.print(); // Simple browser print as a placeholder
  };


  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline text-primary">GeoVisual Insights Dashboard</h1>
      
      {/* Section 1: Inputs */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2"><UploadCloud /> Data Inputs</CardTitle>
          <CardDescription>Upload your video file and provide location details to begin the analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="video-upload" className="text-lg font-medium">Video File</Label>
              <Input id="video-upload" type="file" accept="video/*" onChange={handleFileUpload} className="mt-2" />
              {videoFile && <p className="mt-2 text-sm text-muted-foreground">Selected: {videoFile.name}</p>}
            </div>
            <div>
              <Label htmlFor="location-context" className="text-lg font-medium">Location Context</Label>
              <Textarea 
                id="location-context" 
                placeholder="e.g., Springfield, IL, near Sangamon River and agricultural fields" 
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {keyframes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><Scissors /> Extracted Keyframes (Mock)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {keyframes.map(kf => (
                  <Card 
                    key={kf.id} 
                    onClick={() => setSelectedKeyframe(kf)}
                    className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-accent/50 ${selectedKeyframe?.id === kf.id ? 'ring-2 ring-accent shadow-accent/30' : 'hover:ring-1 hover:ring-primary/50'}`}
                  >
                    <Image 
                      src={kf.url} 
                      alt={kf.description} 
                      width={320} 
                      height={180} 
                      className="rounded-t-md aspect-video object-cover" 
                      data-ai-hint="landscape scene"
                    />
                    <CardFooter className="p-2 bg-muted/30 rounded-b-md">
                      <p className="text-xs text-center w-full">{kf.description} {selectedKeyframe?.id === kf.id && <CheckCircle2 className="inline ml-1 h-4 w-4 text-accent" />}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {selectedKeyframe && <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedKeyframe.description}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={runAllAnalyses} disabled={!selectedKeyframe || !locationContext || Object.values(loadingStates).some(Boolean)} className="w-full md:w-auto">
             {Object.values(loadingStates).some(Boolean) ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Run All Analyses
            </Button>
        </CardFooter>
      </Card>

      {/* Section 2: AI Analysis Results */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">AI-Powered Analysis</CardTitle>
          <CardDescription>Results from advanced geospatial AI models.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResultsDisplay 
            title="Vegetation Analysis"
            icon={<Leaf className="text-green-600" />}
            data={analysisResults.vegetation}
            isLoading={!!loadingStates.vegetation}
            error={errorStates.vegetation}
          />
          <ResultsDisplay 
            title="Soil Assessment"
            icon={<Layers className="text-yellow-700" />}
            data={analysisResults.soil}
            isLoading={!!loadingStates.soil}
            error={errorStates.soil}
          />
           <InfrastructureResultsDisplay
            title="Infrastructure Detection"
            icon={<Building2 className="text-gray-600" />}
            data={analysisResults.infrastructure}
            isLoading={!!loadingStates.infrastructure}
            error={errorStates.infrastructure}
          />
          <ResultsDisplay 
            title="Proximity Analysis"
            icon={<LocateFixed className="text-blue-600" />}
            data={analysisResults.proximity}
            isLoading={!!loadingStates.proximity}
            error={errorStates.proximity}
          />
        </CardContent>
         <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={runVegetationAnalysis} variant="outline" disabled={!!loadingStates.vegetation || !selectedKeyframe || !locationContext}>
                {loadingStates.vegetation ? <Spinner className="mr-2 h-4 w-4" /> : <Leaf size={16} className="mr-2" />} Analyze Vegetation
            </Button>
            <Button onClick={runSoilAssessment} variant="outline" disabled={!!loadingStates.soil || !selectedKeyframe || !locationContext}>
                {loadingStates.soil ? <Spinner className="mr-2 h-4 w-4" /> : <Layers size={16} className="mr-2" />} Assess Soil
            </Button>
            <Button onClick={runInfrastructureDetection} variant="outline" disabled={!!loadingStates.infrastructure || !selectedKeyframe}>
                {loadingStates.infrastructure ? <Spinner className="mr-2 h-4 w-4" /> : <Building2 size={16} className="mr-2" />} Detect Infrastructure & Proximity
            </Button>
        </CardFooter>
      </Card>
      
      {/* Section 3: Contextual Data */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Contextual Data</CardTitle>
          <CardDescription>Geospatial and climate information for the specified area.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <Label htmlFor="geospatial-city" className="text-md font-medium">City</Label>
                    <Input id="geospatial-city" placeholder="e.g., San Francisco" value={geospatialCity} onChange={(e) => setGeospatialCity(e.target.value)} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="geospatial-state" className="text-md font-medium">State/Region</Label>
                    <Input id="geospatial-state" placeholder="e.g., CA" value={geospatialState} onChange={(e) => setGeospatialState(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={fetchGeospatialData} disabled={!!loadingStates.geospatial || !geospatialCity || !geospatialState} className="w-full md:w-auto">
                    {loadingStates.geospatial ? <Spinner className="mr-2 h-4 w-4" /> : <MapPin size={16} className="mr-2" />} Fetch Geospatial Data
                </Button>
            </div>
             <div className="grid md:grid-cols-2 gap-6 mt-4">
                <ResultsDisplay 
                    title="Geospatial Data"
                    icon={<Users className="text-purple-600" />}
                    data={geospatialData}
                    isLoading={!!loadingStates.geospatial}
                    error={errorStates.geospatial}
                />
                <ResultsDisplay 
                    title="Historical Climate Data"
                    icon={<CloudRain className="text-sky-600" />}
                    data={climateData}
                    isLoading={!!loadingStates.climate}
                    error={errorStates.climate}
                />
            </div>
        </CardContent>
      </Card>

      {/* Section 4: Report Generation */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2"><FileText /> Generate Report</CardTitle>
          <CardDescription>Compile all analyses and data into a downloadable PDF report.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Once all analyses are complete and data is satisfactory, you can generate a comprehensive PDF report.
          </p>
          <Button onClick={generatePdfReport} size="lg" className="w-full md:w-auto" disabled={Object.values(loadingStates).some(Boolean)}>
            <FileText size={20} className="mr-2" />
            Generate PDF Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
