
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Navigation, Pause, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";

interface GoogleMapLinkProps {
  latitude: number;
  longitude: number;
  name: string;
  accuracy?: number;
  onRefresh?: () => void;
  onPause?: () => void;
  isPaused?: boolean;
}

export const GoogleMapLink: React.FC<GoogleMapLinkProps> = ({ 
  latitude, 
  longitude, 
  name, 
  accuracy, 
  onRefresh, 
  onPause, 
  isPaused 
}) => {
  const handleOpenGoogleMaps = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleOpenGoogleMaps}
        className="flex items-center gap-1"
      >
        <Navigation className="h-4 w-4 mr-1 text-blue-500" />
        <span>View on Google Maps</span>
        <ExternalLink className="h-3 w-3 ml-1" />
      </Button>
      <div className="flex items-center gap-2 mt-1">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRefresh();
            }}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry Location
          </Button>
        )}
        
        {onPause && (
          <Button 
            variant={isPaused ? "default" : "outline"} 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPause();
            }}
            className={`flex-1 ${isPaused ? "bg-amber-600 hover:bg-amber-700" : ""}`}
          >
            <Pause className="h-4 w-4 mr-1" />
            {isPaused ? "Location Paused" : "Pause Location"}
          </Button>
        )}
      </div>
      
      {accuracy && (
        <Badge variant="outline" className={`self-start text-xs ${isPaused ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <MapPin className={`h-3 w-3 mr-1 ${isPaused ? "text-amber-500" : "text-green-500"}`} />
          Accuracy: ±{accuracy.toFixed(1)}m
          {isPaused && <span className="ml-1 text-amber-600">(Paused)</span>}
        </Badge>
      )}
    </div>
  );
};
