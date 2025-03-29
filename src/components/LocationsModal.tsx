
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldWorkerMap } from './FieldWorkerMap';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
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
          <FieldWorkerMap locations={locations} />
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>{location.lastActive}</TableCell>
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
