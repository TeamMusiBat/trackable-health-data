
import React from 'react';
import { MapPin, Navigation, Target } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

  // Calculate the center point of all locations
  const centerLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
  
  // In a real implementation, this would use an actual map library like Mapbox, Leaflet, or Google Maps
  return (
    <div className="bg-muted/20 relative rounded-lg h-[300px] border overflow-hidden">
      {/* Mock map background - using a more detailed map style */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${centerLng.toFixed(4)},${centerLat.toFixed(4)},12,0/800x400?access_token=pk.eyJ1IjoibG92YWJsZWZpeCIsImEiOiJjbHo4Z2k4a28wM3BjMmltcW9lYnZ0MDdiIn0.EYb8xiGqNTFRuEE77vFB0g')`
        }}
      ></div>
      
      {/* Center marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center">
          <Target className="h-4 w-4 text-blue-500" />
        </div>
      </div>
      
      {/* Map markers */}
      {locations.map((location, index) => {
        // Calculate position based on lat/long (simplified for demo)
        // This is just a visual approximation, not geographically accurate
        const left = ((location.longitude - centerLng) * 2000) + 50;
        const top = ((centerLat - location.latitude) * 2000) + 50;
        
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
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-pulse">
                  <MapPin className="h-5 w-5" />
                </div>
                {location.accuracy && (
                  <div 
                    className="absolute -inset-2 rounded-full bg-primary/30 animate-pulse"
                    style={{ 
                      width: `${Math.max(32, Math.min(location.accuracy, 100) * 0.8)}px`,
                      height: `${Math.max(32, Math.min(location.accuracy, 100) * 0.8)}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                )}
              </div>
              <div className="mt-1 px-2 py-1 bg-background rounded-md text-xs shadow-sm border">
                {location.name}
                <div className="flex flex-col gap-1 mt-1">
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
      <div className="absolute bottom-2 right-2 bg-background/90 p-2 rounded-md text-xs border">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
          <span>Field Worker Location</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 rounded-full bg-primary/20 mr-1"></div>
          <span>Accuracy Radius</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span>Center Point</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md">
          <Target className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
