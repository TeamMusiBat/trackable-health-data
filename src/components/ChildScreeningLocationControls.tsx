
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Pause } from "lucide-react";

interface ChildScreeningLocationControlsProps {
  locationStatus: string;
  locationCoords: { latitude: number; longitude: number; accuracy?: number } | null;
  isPaused: boolean;
  onCaptureLocation: () => void;
  onPauseLocation: () => void;
}

const ChildScreeningLocationControls: React.FC<ChildScreeningLocationControlsProps> = ({
  locationStatus,
  locationCoords,
  isPaused,
  onCaptureLocation,
  onPauseLocation
}) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="location">Location Status</Label>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={onCaptureLocation}
            className="h-8"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {locationCoords ? "Refresh" : "Get Location"}
          </Button>
          
          <Button 
            type="button" 
            variant={isPaused ? "default" : "outline"}
            size="sm"
            onClick={onPauseLocation}
            className={`h-8 ${isPaused ? "bg-amber-600 hover:bg-amber-700" : ""}`}
          >
            <Pause className="h-4 w-4 mr-1" />
            {isPaused ? "Location Paused" : "Pause Location"}
          </Button>
        </div>
      </div>
      
      <div className={`p-3 border rounded-md ${
        isPaused 
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
          : locationCoords 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-muted border-muted-foreground/20'
      }`}>
        <div className="flex items-center gap-2">
          <MapPin className={
            isPaused 
              ? "text-amber-600 dark:text-amber-400" 
              : locationCoords 
                ? "text-green-600 dark:text-green-400" 
                : "text-muted-foreground"
          } />
          <div className="text-sm">
            {isPaused 
              ? "Location capture paused" 
              : locationStatus || (locationCoords ? "Location captured successfully" : "Waiting for location...")}
            
            {locationCoords && !isPaused && (
              <div className="text-xs text-muted-foreground mt-1">
                Coordinates: {locationCoords.latitude.toFixed(6)}, {locationCoords.longitude.toFixed(6)}
                {locationCoords.accuracy && ` (±${locationCoords.accuracy.toFixed(1)}m)`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildScreeningLocationControls;
