
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
  accuracy?: number;
}

interface FieldWorkerMapProps {
  locations: Location[];
}

export const FieldWorkerMap: React.FC<FieldWorkerMapProps> = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg h-[300px] flex items-center justify-center border">
        <div className="text-muted-foreground">No location data available</div>
      </div>
    );
  }

  // In a real implementation, this would use an actual map library like Mapbox, Leaflet, or Google Maps
  return (
    <div className="bg-muted/20 relative rounded-lg h-[300px] border overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/74.34,31.52,9,0/500x300?access_token=pk.eyJ1IjoibG92YWJsZWZpeCIsImEiOiJjbHo4Z2k4a28wM3BjMmltcW9lYnZ0MDdiIn0.EYb8xiGqNTFRuEE77vFB0g')] bg-cover bg-center opacity-50"></div>
      
      {/* Map markers */}
      {locations.map((location, index) => {
        // Calculate position based on lat/long (simplified for demo)
        // This is just a visual approximation, not geographically accurate
        const left = ((location.longitude - 74.33) * 1000) + 50;
        const top = ((31.53 - location.latitude) * 1000) + 150;
        
        return (
          <div 
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ 
              left: `${left}%`, 
              top: `${top}%` 
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                {location.accuracy && (
                  <div 
                    className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse"
                    style={{ 
                      width: `${Math.max(32, location.accuracy * 3)}px`,
                      height: `${Math.max(32, location.accuracy * 3)}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                )}
              </div>
              <div className="mt-1 px-2 py-1 bg-background rounded-md text-xs shadow-sm border">
                {location.name}
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {location.lastActive}
                  </Badge>
                  {location.accuracy && (
                    <Badge variant="secondary" className="text-[10px]">
                      ±{location.accuracy}m
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-background/80 p-2 rounded-md text-xs border">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
          <span>Field Worker Location</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 rounded-full bg-primary/20 mr-1"></div>
          <span>Accuracy Radius</span>
        </div>
      </div>
    </div>
  );
};
