
import React, { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
}

interface GlobeViewProps {
  locations: Location[];
}

export const GlobeView: React.FC<GlobeViewProps> = ({ locations }) => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    const loadGlobe = async () => {
      try {
        // In a real implementation, we would use a 3D globe library like Three.js or Globe.GL
        // For now, we're creating a simplified visualization
        const container = globeRef.current;
        if (!container) return;

        // Clear any existing content
        container.innerHTML = '';

        // Create our simulated globe
        const globe = document.createElement('div');
        globe.className = 'relative w-full h-full bg-slate-800 rounded-full overflow-hidden';
        globe.style.backgroundImage = 'url("https://img.freepik.com/free-vector/blue-futuristic-networking-technology_53876-97395.jpg")';
        globe.style.backgroundSize = 'cover';
        container.appendChild(globe);

        // Add location markers
        locations.forEach(location => {
          // Convert lat/long to x/y coordinates on a sphere
          // This is a simplified calculation for visualization
          const phi = (90 - location.latitude) * (Math.PI / 180);
          const theta = (location.longitude + 180) * (Math.PI / 180);
          
          // Convert to Cartesian coordinates
          const x = 50 + 40 * Math.sin(phi) * Math.cos(theta);
          const y = 50 + 40 * Math.cos(phi);
          
          // Create marker
          const marker = document.createElement('div');
          marker.className = 'absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer';
          marker.style.left = `${x}%`;
          marker.style.top = `${y}%`;
          
          // Pulsing effect
          const pulse = document.createElement('div');
          pulse.className = 'absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75';
          marker.appendChild(pulse);
          
          // Tooltip
          marker.title = `${location.name} (${location.lastActive})`;
          
          // Click handler
          marker.addEventListener('click', () => {
            toast({
              title: location.name,
              description: `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}\nLast active: ${location.lastActive}`,
            });
          });
          
          globe.appendChild(marker);
        });
      } catch (error) {
        console.error('Failed to initialize globe:', error);
      }
    };

    loadGlobe();

    return () => {
      // Cleanup if necessary
    };
  }, [locations]);

  return (
    <div 
      ref={globeRef} 
      className="w-full h-[300px] relative bg-muted/30 rounded-lg border overflow-hidden"
    >
      {locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No location data available</p>
        </div>
      )}
    </div>
  );
};
