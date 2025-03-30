import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Calendar, CalendarDays, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange }) => {
  const { exportData } = useData();
  
  const [exportOptions, setExportOptions] = useState({
    samOnly: false,
    mamOnly: false,
    splitByWorker: false,
    timeRange: 'today' as 'today' | 'all',
  });

  const handleExport = (type: 'child' | 'fmt' | 'sm') => {
    let filter: 'today' | 'all' | 'sam' | 'mam' = exportOptions.timeRange;
    
    if (type === 'child') {
      if (exportOptions.samOnly && !exportOptions.mamOnly) {
        filter = 'sam';
      } else if (exportOptions.mamOnly && !exportOptions.samOnly) {
        filter = 'mam';
      }
    }
    
    exportData(type, filter);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose export options and format
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="child" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="child">Child Screening</TabsTrigger>
            <TabsTrigger value="fmt">FMT Sessions</TabsTrigger>
            <TabsTrigger value="sm">SM Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="child" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Time Range</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="today" 
                      checked={exportOptions.timeRange === 'today'}
                      onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'today'})}
                    />
                    <Label htmlFor="today" className="cursor-pointer">Today only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all" 
                      checked={exportOptions.timeRange === 'all'}
                      onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'all'})}
                    />
                    <Label htmlFor="all" className="cursor-pointer">All records</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label>Filter Options</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sam" 
                      checked={exportOptions.samOnly}
                      onCheckedChange={(checked) => setExportOptions({...exportOptions, samOnly: !!checked})}
                    />
                    <Label htmlFor="sam" className="cursor-pointer">SAM cases only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mam" 
                      checked={exportOptions.mamOnly}
                      onCheckedChange={(checked) => setExportOptions({...exportOptions, mamOnly: !!checked})}
                    />
                    <Label htmlFor="mam" className="cursor-pointer">MAM cases only</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="split" 
                  checked={exportOptions.splitByWorker}
                  onCheckedChange={(checked) => setExportOptions({...exportOptions, splitByWorker: !!checked})}
                />
                <Label htmlFor="split" className="cursor-pointer">Split by field worker</Label>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => handleExport('child')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Child Screening Data
            </Button>
          </TabsContent>
          
          <TabsContent value="fmt" className="space-y-4 pt-4">
            <div className="flex flex-col space-y-2">
              <Label>Time Range</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fmt-today" 
                    checked={exportOptions.timeRange === 'today'}
                    onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'today'})}
                  />
                  <Label htmlFor="fmt-today" className="cursor-pointer">Today only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fmt-all" 
                    checked={exportOptions.timeRange === 'all'}
                    onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'all'})}
                  />
                  <Label htmlFor="fmt-all" className="cursor-pointer">All records</Label>
                </div>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => handleExport('fmt')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export FMT Sessions Data
            </Button>
          </TabsContent>
          
          <TabsContent value="sm" className="space-y-4 pt-4">
            <div className="flex flex-col space-y-2">
              <Label>Time Range</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sm-today" 
                    checked={exportOptions.timeRange === 'today'}
                    onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'today'})}
                  />
                  <Label htmlFor="sm-today" className="cursor-pointer">Today only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sm-all" 
                    checked={exportOptions.timeRange === 'all'}
                    onCheckedChange={() => setExportOptions({...exportOptions, timeRange: 'all'})}
                  />
                  <Label htmlFor="sm-all" className="cursor-pointer">All records</Label>
                </div>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => handleExport('sm')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Social Mobilizer Sessions Data
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
