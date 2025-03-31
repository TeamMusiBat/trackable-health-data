import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageCapture } from "@/components/ImageCapture";
import { EditableEntry } from "@/components/EditableEntry";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { FileSpreadsheet, Plus, X, Map, Building, Wifi, WifiOff, Image as ImageIcon, MapPin } from "lucide-react";
import { AwarenessSessionData } from "@/lib/types";
import { format } from "date-fns";

interface SessionFormData {
  sessionNumber: number;
  name: string;
  fatherOrHusband: string;
  villageName: string;
  ucName: string;
  age: number | string;
  underFiveChildren: number | string;
  contactNumber: string;
  sameUc: string;
  alternateLocation: string;
  locationCoords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  images?: string[];
}

const initialFormState: SessionFormData = {
  sessionNumber: 1,
  name: "",
  fatherOrHusband: "",
  villageName: "",
  ucName: "",
  age: "",
  underFiveChildren: "",
  contactNumber: "",
  sameUc: "",
  alternateLocation: "",
  images: [],
};

const AwarenessSession = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { awarenessSessionsFMT, awarenessSessionsSM, addAwarenessSession, bulkAddAwarenessSession, updateAwarenessSession, exportData, isOnline } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const defaultType = searchParams.get("type") || "fmt";
  const [sessionType, setSessionType] = useState<"fmt" | "sm">(defaultType as "fmt" | "sm");
  
  const sessionTypeTitle = sessionType === "fmt" ? "FMT" : "Social Mobilizers";
  const pageTitle = `Awareness Sessions`;
  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");
  
  const storedLocation = localStorage.getItem('sessionLocation');
  let parsedLocation = { villageName: "", ucName: "" };
  
  if (storedLocation) {
    try {
      parsedLocation = JSON.parse(storedLocation);
    } catch (e) {
      console.error('Failed to parse stored location', e);
    }
  }
  
  const [formData, setFormData] = useState<SessionFormData>({
    ...initialFormState,
    villageName: parsedLocation.villageName || "",
    ucName: parsedLocation.ucName || "",
  });
  
  const [bulkEntries, setBulkEntries] = useState<SessionFormData[]>([]);
  const [locationCaptureInProgress, setLocationCaptureInProgress] = useState(false);

  const todayString = today.toDateString();
  const sessionsData = sessionType === "fmt" ? awarenessSessionsFMT : awarenessSessionsSM;
  const todaysSessions = sessionsData.filter(
    session => new Date(session.date).toDateString() === todayString
  );
  
  const [locationSet, setLocationSet] = useState(
    !!(parsedLocation.villageName && parsedLocation.ucName)
  );

  useEffect(() => {
    if (todaysSessions.length > 0) {
      const maxSessionNumber = Math.max(...todaysSessions.map(s => s.sessionNumber || 0));
      setFormData(prev => ({
        ...prev,
        sessionNumber: maxSessionNumber + 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sessionNumber: 1
      }));
    }
  }, [todaysSessions, sessionType]);

  const handleTypeChange = (value: string) => {
    setSessionType(value as "fmt" | "sm");
    setSearchParams({ type: value });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    
    if (name === 'age' || name === 'underFiveChildren') {
      const numValue = value === '' ? '' : String(parseInt(value || '0', 10));
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else if (name === 'name' || name === 'fatherOrHusband') {
      let formattedValue = value
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim();
      
      formattedValue = formattedValue.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
      
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      if (name === 'villageName' || name === 'ucName') {
        const newLocation = {
          villageName: name === 'villageName' ? value : formData.villageName,
          ucName: name === 'ucName' ? value : formData.ucName
        };
        
        if (newLocation.villageName && newLocation.ucName) {
          localStorage.setItem('sessionLocation', JSON.stringify(newLocation));
          setLocationSet(true);
        }
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameUc: checked ? "Yes" : "No",
      alternateLocation: checked ? "" : prev.alternateLocation
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const captureLocation = () => {
    setLocationCaptureInProgress(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          setFormData(prev => ({
            ...prev,
            locationCoords: {
              latitude,
              longitude,
              accuracy
            }
          }));
          
          toast({
            title: "Location captured successfully",
            description: `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}, Accuracy: ${accuracy ? accuracy.toFixed(1) + 'm' : 'unknown'}`,
          });
          
          setLocationCaptureInProgress(false);
        },
        (error) => {
          toast({
            title: "Error getting location",
            description: error.message,
            variant: "destructive"
          });
          setLocationCaptureInProgress(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive"
      });
      setLocationCaptureInProgress(false);
    }
  };

  const handleAddToBulk = () => {
    if (!formData.name || !formData.fatherOrHusband || !formData.villageName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setBulkEntries([
      ...bulkEntries,
      { 
        ...formData,
        age: formData.age === '' ? 0 : parseInt(String(formData.age), 10),
        underFiveChildren: formData.underFiveChildren === '' ? 0 : parseInt(String(formData.underFiveChildren), 10),
      },
    ]);
    
    setFormData({
      ...initialFormState,
      sessionNumber: formData.sessionNumber + 1,
      villageName: formData.villageName,
      ucName: formData.ucName,
      sameUc: formData.sameUc,
      locationCoords: formData.locationCoords,
    });

    toast({
      title: "Entry added",
      description: "Participant added to bulk entry list",
    });
  };

  const handleRemoveFromBulk = (index: number) => {
    const newEntries = [...bulkEntries];
    newEntries.splice(index, 1);
    setBulkEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.fatherOrHusband || !formData.villageName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await addAwarenessSession({
      ...formData,
      serialNo: 0, // No longer needed
      age: formData.age === '' ? 0 : parseInt(String(formData.age), 10),
      underFiveChildren: formData.underFiveChildren === '' ? 0 : parseInt(String(formData.underFiveChildren), 10),
      type: sessionType === "fmt" ? "FMT" : "Social Mobilizers" as any,
      date: new Date(),
    });

    setFormData({
      ...initialFormState,
      sessionNumber: formData.sessionNumber + 1,
      villageName: formData.villageName,
      ucName: formData.ucName,
      sameUc: formData.sameUc,
      locationCoords: formData.locationCoords,
    });

    toast({
      title: "Entry saved",
      description: "Awareness session participant has been saved",
    });
  };

  const handleBulkSubmit = async () => {
    if (bulkEntries.length === 0) {
      toast({
        title: "No entries",
        description: "Please add at least one participant to the bulk entry list",
        variant: "destructive",
      });
      return;
    }

    const processedEntries = bulkEntries.map(entry => ({
      ...entry,
      serialNo: 0, // No longer needed
      age: typeof entry.age === 'string' ? parseInt(entry.age || '0', 10) : entry.age,
      underFiveChildren: typeof entry.underFiveChildren === 'string' ? 
        parseInt(String(entry.underFiveChildren || '0'), 10) : entry.underFiveChildren,
      type: sessionType === "fmt" ? "FMT" : "Social Mobilizers" as any,
      date: new Date(),
    }));

    await bulkAddAwarenessSession(processedEntries);
    
    setBulkEntries([]);
    setFormData({
      ...initialFormState,
      sessionNumber: formData.sessionNumber + processedEntries.length,
      villageName: formData.villageName,
      ucName: formData.ucName,
      sameUc: formData.sameUc,
      locationCoords: formData.locationCoords,
    });

    toast({
      title: "Bulk entries saved",
      description: `${processedEntries.length} participants have been saved`,
    });
  };

  const handleExport = (filter: 'today' | 'all' = 'today') => {
    exportData(sessionType === 'fmt' ? 'fmt' : 'sm', filter);
  };

  const handleUpdateSession = (id: string, updatedData: Partial<AwarenessSessionData>) => {
    if (updatedData.name) {
      updatedData.name = updatedData.name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    
    if (updatedData.fatherOrHusband) {
      updatedData.fatherOrHusband = updatedData.fatherOrHusband
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    
    updateAwarenessSession(id, updatedData);
  };

  const canEdit = currentUser?.role === 'developer' || currentUser?.role === 'master';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const locationTitle = formData.villageName && formData.ucName 
    ? `${formData.villageName}, ${formData.ucName}` 
    : 'Please set location';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground">
              Record participants for {sessionTypeTitle.toLowerCase()} awareness sessions
            </p>
            <p className="text-sm font-medium mt-1">{formattedDate}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleExport('today')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Today
            </Button>
            <Button variant="outline" onClick={() => handleExport('all')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Tabs defaultValue={sessionType} onValueChange={handleTypeChange} className="w-full">
            <TabsList>
              <TabsTrigger value="fmt">FMT Sessions</TabsTrigger>
              <TabsTrigger value="sm">Social Mobilizers Sessions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="mb-4">
          <Tabs defaultValue="entry">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="entry">Data Entry</TabsTrigger>
              <TabsTrigger value="today">Today's Sessions ({todaysSessions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entry">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Participant Information</CardTitle>
                    <CardDescription>
                      Enter participant details for {sessionTypeTitle.toLowerCase()} awareness session 
                      {locationSet ? ` in ${formData.villageName}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="bg-muted p-4 rounded-md mb-4">
                        <h3 className="font-medium mb-2 flex items-center gap-1">
                          <Map className="h-4 w-4" /> 
                          Session Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="sessionNumber">Session Number</Label>
                            <Input
                              id="sessionNumber"
                              name="sessionNumber"
                              type="number"
                              value={formData.sessionNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              name="date"
                              type="text"
                              value={formattedDate}
                              disabled
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <Button 
                            type="button" 
                            variant={locationCaptureInProgress ? "secondary" : "outline"}
                            className="w-full flex gap-2"
                            onClick={captureLocation}
                            disabled={locationCaptureInProgress}
                          >
                            <MapPin className="h-4 w-4" />
                            {locationCaptureInProgress ? "Capturing Location..." : "Capture GPS Location"}
                          </Button>
                          {formData.locationCoords && (
                            <div className="text-xs text-center text-muted-foreground">
                              Location: {formData.locationCoords.latitude.toFixed(5)}, {formData.locationCoords.longitude.toFixed(5)}
                              {formData.locationCoords.accuracy && ` (±${formData.locationCoords.accuracy.toFixed(0)}m)`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md mb-4">
                        <h3 className="font-medium mb-2 flex items-center gap-1">
                          <Map className="h-4 w-4" /> 
                          Session Location
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="villageName">Village Name *</Label>
                            <Input
                              id="villageName"
                              name="villageName"
                              value={formData.villageName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ucName">UC Name *</Label>
                            <Input
                              id="ucName"
                              name="ucName"
                              value={formData.ucName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fatherOrHusband">Father/Husband Name *</Label>
                        <Input
                          id="fatherOrHusband"
                          name="fatherOrHusband"
                          value={formData.fatherOrHusband}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="1"
                          value={formData.age}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="underFiveChildren">Under Five Year Children</Label>
                        <Input
                          id="underFiveChildren"
                          name="underFiveChildren"
                          type="number"
                          min="0"
                          value={formData.underFiveChildren}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          placeholder="Optional"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox id="sameUc" checked={formData.sameUc} onCheckedChange={handleCheckboxChange} />
                          <Label htmlFor="sameUc">Person belongs to same UC</Label>
                        </div>
                        {!formData.sameUc && (
                          <Input
                            id="alternateLocation"
                            name="alternateLocation"
                            placeholder="Enter alternate location/address"
                            value={formData.alternateLocation}
                            onChange={handleInputChange}
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Session Images</Label>
                        <ImageCapture onImagesChange={handleImagesChange} />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="button" onClick={handleAddToBulk} className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Bulk
                        </Button>
                        <Button type="submit" className="flex-1">
                          Save Single
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Bulk Entry List</CardTitle>
                      <CardDescription>
                        {bulkEntries.length} participants ready for submission
                        {locationSet ? ` in ${formData.villageName}, ${formData.ucName}` : ''}
                      </CardDescription>
                    </div>
                    <Button onClick={handleBulkSubmit} disabled={bulkEntries.length === 0}>
                      Save All Entries
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {bulkEntries.length > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Session #</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Father/Husband</TableHead>
                              <TableHead>Age</TableHead>
                              <TableHead>Village</TableHead>
                              <TableHead>UC Same</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bulkEntries.map((entry, index) => (
                              <TableRow key={index}>
                                <TableCell>{entry.sessionNumber}</TableCell>
                                <TableCell className="font-medium">{entry.name}</TableCell>
                                <TableCell>{entry.fatherOrHusband}</TableCell>
                                <TableCell>{entry.age}</TableCell>
                                <TableCell>{entry.villageName}</TableCell>
                                <TableCell>{entry.sameUc ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFromBulk(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-3 mb-4">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No entries yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          Add participants to the bulk entry list using the form on the left.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="today">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Today's Sessions</CardTitle>
                    <CardDescription>
                      {todaysSessions.length} participants added today
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => handleExport('today')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {todaysSessions.length > 0 ? (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Session #</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Father/Husband</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Under 5</TableHead>
                            <TableHead>Village</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Images</TableHead>
                            {canEdit && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {todaysSessions.map((session, index) => (
                            <TableRow key={session.id}>
                              <TableCell>{session.sessionNumber || 1}</TableCell>
                              <TableCell className="font-medium">{session.name}</TableCell>
                              <TableCell>{session.fatherOrHusband}</TableCell>
                              <TableCell>{session.age}</TableCell>
                              <TableCell>{session.underFiveChildren}</TableCell>
                              <TableCell>
                                {session.locationCoords ? (
                                  <Button 
                                    variant="link" 
                                    className="p-0 h-auto text-blue-600 dark:text-blue-400 underline"
                                    onClick={() => window.open(`https://www.google.com/maps?q=${session.locationCoords.latitude},${session.locationCoords.longitude}`, '_blank')}
                                  >
                                    {session.villageName}
                                  </Button>
                                ) : (
                                  session.villageName
                                )}
                              </TableCell>
                              <TableCell>{session.sameUc ? "Same UC" : session.alternateLocation || "-"}</TableCell>
                              <TableCell>
                                {session.images && session.images.length > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>{session.images.length}</span>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              {canEdit && (
                                <TableCell>
                                  <EditableEntry
                                    data={session}
                                    onSave={(updatedData) => handleUpdateSession(session.id, updatedData)}
                                    title="Awareness Session"
                                    fieldConfig={[
                                      { name: "sessionNumber", label: "Session Number", type: "number" },
                                      { name: "name", label: "Name", type: "text" },
                                      { name: "fatherOrHusband", label: "Father/Husband Name", type: "text" },
                                      { name: "age", label: "Age", type: "number" },
                                      { name: "underFiveChildren", label: "Under Five Children", type: "number" },
                                      { name: "contactNumber", label: "Contact Number", type: "text" },
                                      { name: "villageName", label: "Village", type: "text" },
                                      { name: "ucName", label: "UC Name", type: "text" },
                                      { name: "sameUc", label: "Person belongs to same UC", type: "text", required: true },
                                      { name: "alternateLocation", label: "Alternate Location", type: "text" },
                                      { name: "images", label: "Images", type: "images" }
                                    ]}
                                  />
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No sessions today</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Start adding participants to see them appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AwarenessSession;
