
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldWorkerMap } from './FieldWorkerMap';
import { GlobeView } from './GlobeView';
import { GoogleMapLink } from './GoogleMapLink';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { RefreshCw, Map, Globe, Navigation, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
  accuracy?: number;
}

interface LocationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  onRefresh: () => void;
}

export const LocationsModal: React.FC<LocationsModalProps> = ({ 
  open, 
  onOpenChange, 
  locations, 
  onRefresh 
}) => {
  const [viewMode, setViewMode] = useState<"map" | "globe">("map");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Field Worker Locations</span>
            <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </DialogTitle>
          <DialogDescription>
            Real-time location of active field workers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="map" onClick={() => setViewMode("map")}>
                <Map className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="globe" onClick={() => setViewMode("globe")}>
                <Globe className="h-4 w-4 mr-2" />
                Globe View
              </TabsTrigger>
            </TabsList>
            <TabsContent value="map">
              <FieldWorkerMap locations={locations} />
            </TabsContent>
            <TabsContent value="globe">
              <GlobeView locations={locations} />
            </TabsContent>
          </Tabs>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <span className="text-xs flex items-center">
                        <MapPin className="h-3 w-3 text-primary mr-1" />
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {location.accuracy ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                          ±{location.accuracy.toFixed(1)}m
                        </Badge>
                      ) : (
                        "Unknown"
                      )}
                    </TableCell>
                    <TableCell>{location.lastActive}</TableCell>
                    <TableCell>
                      <GoogleMapLink 
                        latitude={location.latitude} 
                        longitude={location.longitude} 
                        name={location.name} 
                        accuracy={location.accuracy}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
