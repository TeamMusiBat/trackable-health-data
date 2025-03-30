
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin } from "lucide-react";

interface GoogleMapLinkProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const GoogleMapLink: React.FC<GoogleMapLinkProps> = ({ latitude, longitude, name }) => {
  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleOpenGoogleMaps}
      className="flex items-center gap-1 text-xs"
    >
      <MapPin className="h-3 w-3" />
      <span className="mr-1">View on Google Maps</span>
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
};
