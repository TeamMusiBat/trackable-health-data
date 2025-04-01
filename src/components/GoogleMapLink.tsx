
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { Badge } from "./ui/badge";

interface GoogleMapLinkProps {
  latitude: number;
  longitude: number;
  name: string;
  accuracy?: number;
}

export const GoogleMapLink: React.FC<GoogleMapLinkProps> = ({ latitude, longitude, name, accuracy }) => {
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
      {accuracy && (
        <Badge variant="outline" className="self-start text-xs">
          <MapPin className="h-3 w-3 mr-1 text-green-500" />
          Accuracy: ±{accuracy.toFixed(1)}m
        </Badge>
      )}
    </div>
  );
};
