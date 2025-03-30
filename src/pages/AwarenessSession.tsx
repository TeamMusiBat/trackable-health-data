import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CardFooter,
} from "@/components/ui/card";
import { ImageCapture } from "@/components/ImageCapture";
import { EditableEntry } from "@/components/EditableEntry";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { FileSpreadsheet, Plus, X, Map, Building, Wifi, WifiOff, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwarenessSessionData, AwarenessSessionProps } from "@/lib/types";

interface SessionFormData {
  serialNo: number;
  name: string;
  fatherOrHusband: string;
  villageName: string;
  ucName: string;
  age: number | string;
  underFiveChildren: number | string;
  contactNumber: string;
  images?: string[];
}

const initialFormState: SessionFormData = {
  serialNo: 1,
  name: "",
  fatherOrHusband: "",
  villageName: "",
  ucName: "",
  age: "",
  underFiveChildren: "",
  contactNumber: "",
  images: [],
};

const AwarenessSession = ({ type }: AwarenessSessionProps) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { awarenessSessionsFMT, awarenessSessionsSM, addAwarenessSession, bulkAddAwarenessSession, updateAwarenessSession, exportData, isOnline } = useData();

  const sessionType = type === "fmt" ? "FMT" : "Social Mobilizers";
  const pageTitle = `${sessionType} Awareness Sessions`;
  
  // Initialize form data with stored location if available
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
    ucName: parsedLocation.ucName || ""
  });
  
  const [bulkEntries, setBulkEntries] = useState<SessionFormData[]>([]);

  // Get today's data for display in Today's Sessions tab
  const today = new Date().toDateString();
  const sessionsData = type === "fmt" ? awarenessSessionsFMT : awarenessSessionsSM;
  const todaysSessions = sessionsData.filter(
    session => new Date(session.date).toDateString() === today
  );
  
  // For location prominence
  const [locationSet, setLocationSet] = useState(
    !!(parsedLocation.villageName && parsedLocation.ucName)
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    
    if (name === 'age' || name === 'underFiveChildren') {
      // Remove leading zeros for numeric fields
      const numValue = value === '' ? '' : String(parseInt(value || '0', 10));
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Update location in localStorage when either village or UC changes
      if (name === 'villageName' || name === 'ucName') {
        const newLocation = {
          villageName: name === 'villageName' ? value : formData.villageName,
          ucName: name === 'ucName' ? value : formData.ucName
        };
        
        // Only save and update if both fields have values
        if (newLocation.villageName && newLocation.ucName) {
          localStorage.setItem('sessionLocation', JSON.stringify(newLocation));
          setLocationSet(true);
        }
      }
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
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

    // Add to bulk entries, ensuring numbers are parsed
    setBulkEntries([
      ...bulkEntries,
      { 
        ...formData, 
        serialNo: bulkEntries.length + 1,
        age: formData.age === '' ? 0 : parseInt(String(formData.age), 10),
        underFiveChildren: formData.underFiveChildren === '' ? 0 : parseInt(String(formData.underFiveChildren), 10),
      },
    ]);
    
    // Reset form but keep village and UC
    setFormData({
      ...initialFormState,
      serialNo: bulkEntries.length + 2,
      villageName: formData.villageName,
      ucName: formData.ucName,
    });

    toast({
      title: "Entry added",
      description: "Participant added to bulk entry list",
    });
  };

  const handleRemoveFromBulk = (index: number) => {
    const newEntries = [...bulkEntries];
    newEntries.splice(index, 1);
    
    // Recalculate serial numbers
    const updatedEntries = newEntries.map((entry, i) => ({
      ...entry,
      serialNo: i + 1,
    }));
    
    setBulkEntries(updatedEntries);
    
    // Update current form's serial number
    setFormData(prev => ({
      ...prev,
      serialNo: updatedEntries.length + 1,
    }));
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

    // Add single entry, ensuring numbers are parsed
    await addAwarenessSession({
      ...formData,
      age: formData.age === '' ? 0 : parseInt(String(formData.age), 10),
      underFiveChildren: formData.underFiveChildren === '' ? 0 : parseInt(String(formData.underFiveChildren), 10),
      type: sessionType as any,
      date: new Date(),
    });

    // Reset form but keep village and UC
    setFormData({
      ...initialFormState,
      villageName: formData.villageName,
      ucName: formData.ucName,
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

    // Add session type and date to all entries
    const processedEntries = bulkEntries.map(entry => ({
      ...entry,
      age: typeof entry.age === 'string' ? parseInt(entry.age || '0', 10) : entry.age,
      underFiveChildren: typeof entry.underFiveChildren === 'string' ? 
        parseInt(String(entry.underFiveChildren || '0'), 10) : entry.underFiveChildren,
      type: sessionType as any,
      date: new Date(),
    }));

    // Bulk submit
    await bulkAddAwarenessSession(processedEntries);
    
    // Reset bulk entries and form
    setBulkEntries([]);
    setFormData({
      ...initialFormState,
      villageName: formData.villageName,
      ucName: formData.ucName,
    });

    toast({
      title: "Bulk entries saved",
      description: `${processedEntries.length} participants have been saved`,
    });
  };

  const handleExport = (filter: 'today' | 'all' = 'today') => {
    exportData(type === 'fmt' ? 'fmt' : 'sm', filter);
  };

  const handleUpdateSession = (id: string, updatedData: Partial<AwarenessSessionData>) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground">
              Record participants for {sessionType.toLowerCase()} awareness sessions
            </p>
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
        
        {/* Online/Offline Status Banner */}
        <div className={`mb-2 p-2 rounded-lg border ${isOnline ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="text-green-600 dark:text-green-400 h-4 w-4" />
            ) : (
              <WifiOff className="text-amber-600 dark:text-amber-400 h-4 w-4" />
            )}
            <div className="text-sm font-medium">
              {isOnline ? "Online - Data will be synced automatically" : "Offline - Data will be saved locally"}
            </div>
          </div>
        </div>
        
        {/* Location Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${locationSet ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
          <div className="flex items-center gap-2">
            <Map className={locationSet ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} />
            <div className="font-medium text-lg">Current Location: {locationTitle}</div>
          </div>
          {locationSet && (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>All new entries will be recorded at this location</span>
            </div>
          )}
        </div>
        
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
                    Enter participant details for {sessionType.toLowerCase()} awareness session 
                    {locationSet ? ` in ${formData.villageName}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Location Input Card (Styled to stand out) */}
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serialNo">Serial No.</Label>
                        <Input
                          id="serialNo"
                          name="serialNo"
                          type="number"
                          value={formData.serialNo}
                          onChange={handleInputChange}
                          required
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          name="date"
                          type="text"
                          value={new Date().toLocaleDateString()}
                          disabled
                        />
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
                            <TableHead className="w-[80px]">S/No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Father/Husband</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Village</TableHead>
                            <TableHead>Images</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkEntries.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{entry.serialNo}</TableCell>
                              <TableCell className="font-medium">{entry.name}</TableCell>
                              <TableCell>{entry.fatherOrHusband}</TableCell>
                              <TableCell>{entry.age}</TableCell>
                              <TableCell>{entry.villageName}</TableCell>
                              <TableCell>{entry.images?.length || 0}</TableCell>
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
                          <TableHead className="w-[80px]">S/No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Father/Husband</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Under 5</TableHead>
                          <TableHead>Village</TableHead>
                          <TableHead>Images</TableHead>
                          {canEdit && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todaysSessions.map((session, index) => (
                          <TableRow key={session.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{session.name}</TableCell>
                            <TableCell>{session.fatherOrHusband}</TableCell>
                            <TableCell>{session.age}</TableCell>
                            <TableCell>{session.underFiveChildren}</TableCell>
                            <TableCell>{session.villageName}</TableCell>
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
                                    { name: "name", label: "Name", type: "text" },
                                    { name: "fatherOrHusband", label: "Father/Husband Name", type: "text" },
                                    { name: "age", label: "Age", type: "number" },
                                    { name: "underFiveChildren", label: "Under Five Children", type: "number" },
                                    { name: "contactNumber", label: "Contact Number", type: "text" },
                                    { name: "villageName", label: "Village", type: "text" },
                                    { name: "ucName", label: "UC Name", type: "text" },
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
      </main>
      
      <Footer />
    </div>
  );
};

export default AwarenessSession;
