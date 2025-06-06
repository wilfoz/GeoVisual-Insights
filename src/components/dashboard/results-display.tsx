import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ResultsDisplayProps {
  title: string;
  data: Record<string, any> | null | undefined;
  isLoading: boolean;
  error: string | null | undefined;
  icon?: React.ReactNode;
}

export function ResultsDisplay({ title, data, isLoading, error, icon }: ResultsDisplayProps) {
  const renderValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2); // Or a more custom rendering
    }
    return String(value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading analysis...</p>}
        {error && (
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle size={18} />
            <p>Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && data && Object.keys(data).length > 0 && (
          <ul className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <li key={key} className="text-sm">
                <strong className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </strong>
                {renderValue(value)}
              </li>
            ))}
          </ul>
        )}
        {!isLoading && !error && data && Object.keys(data).length === 0 && (
          <p className="text-muted-foreground">No data to display.</p>
        )}
        {!isLoading && !error && !data && (
           <p className="text-muted-foreground">Analysis not yet run or no results.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function InfrastructureResultsDisplay({ title, data, isLoading, error, icon }: ResultsDisplayProps) {
  // Specific rendering for infrastructure details which is an array of objects
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading analysis...</p>}
        {error && (
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle size={18} />
            <p>Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && data && data.infrastructureDetails && Array.isArray(data.infrastructureDetails) && data.infrastructureDetails.length > 0 && (
          <div className="space-y-4">
            {data.infrastructureDetails.map((item: any, index: number) => (
              <div key={index} className="p-3 border rounded-md bg-muted/20">
                <h4 className="font-semibold text-md mb-1">Infrastructure Item {index + 1}</h4>
                <p className="text-sm"><strong className="font-medium">Type:</strong> {item.type}</p>
                <p className="text-sm"><strong className="font-medium">Location:</strong> {item.locationDescription}</p>
                {item.proximityToGeoFeatures && <p className="text-sm"><strong className="font-medium">Proximity:</strong> {item.proximityToGeoFeatures}</p>}
              </div>
            ))}
          </div>
        )}
         {!isLoading && !error && (!data || !data.infrastructureDetails || data.infrastructureDetails.length === 0) && (
           <p className="text-muted-foreground">No infrastructure details found or analysis not yet run.</p>
        )}
      </CardContent>
    </Card>
  );
}
