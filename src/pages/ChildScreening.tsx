
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageCapture } from "@/components/ImageCapture";
import { EditableEntry } from "@/components/EditableEntry";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ChildScreeningData, DuplicateEntry } from "@/lib/types";
import { FileSpreadsheet, Plus, AlertTriangle, Building, Wifi, WifiOff, Camera, Image as ImageIcon, User } from "lucide-react";
import ChildScreeningLocationControls from "@/components/ChildScreeningLocationControls";

type Gender = "Male" | "Female" | "Other";

const ChildScreening = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { childScreening, addChildScreening, bulkAddChildScreening, updateChildScreening, checkDuplicate, exportData, isOnline } = useData();

  const [formData, setFormData] = useState({
    name: "",
    father: "",
    age: "", // Changed from 0 to empty string
    gender: "Male" as Gender, // Using proper type
    muac: "", // Changed from 0 to empty string
    unionCouncil: "",
    village: "",
    vaccination: "0 - Dose",
    dueVaccine: false,
    remarks: "",
    images: [] as string[],
  });
  
  const [bulkEntries, setBulkEntries] = useState<Array<Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>>>([]);
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  const [duplicateEntry, setDuplicateEntry] = useState<DuplicateEntry>({ exists: false });
  const [locationCoords, setLocationCoords] = useState<{latitude: number, longitude: number, accuracy?: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [screeningConductor, setScreeningConductor] = useState<string>("");
  const [isLocationPaused, setIsLocationPaused] = useState<boolean>(false);

  const storedLocation = localStorage.getItem('screeningLocation');
  let parsedLocation = { unionCouncil: "", village: "" };

  if (storedLocation) {
    try {
      parsedLocation = JSON.parse(storedLocation);
    } catch (e) {
      console.error('Failed to parse stored location', e);
    }
  }

  const initialFormState = {
    name: "",
    father: "",
    age: "", // Changed from 0 to empty string
    gender: "Male" as Gender, // Using proper type
    muac: "", // Changed from 0 to empty string
    unionCouncil: parsedLocation.unionCouncil || "",
    village: parsedLocation.village || "",
    vaccination: "0 - Dose",
    dueVaccine: false,
    remarks: "",
    images: [] as string[],
  };

  const [locationSet, setLocationSet] = useState(
    !!(parsedLocation.unionCouncil && parsedLocation.village)
  );
  
  const today = new Date().toDateString();
  const todaysScreenings = childScreening.filter(
    item => new Date(item.date).toDateString() === today
  );

  useEffect(() => {
    if (currentUser?.name) {
      setScreeningConductor(currentUser.name);
    }
    
    if (!isLocationPaused) {
      captureLocation();
    }
  }, [currentUser, isLocationPaused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'age' || name === 'muac') {
      const numValue = value === '' ? '' : String(parseFloat(value));
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      if (['unionCouncil', 'village'].includes(name)) {
        const newLocation = {
          unionCouncil: name === 'unionCouncil' ? value : formData.unionCouncil,
          village: name === 'village' ? value : formData.village
        };
        
        if (newLocation.unionCouncil && newLocation.village) {
          localStorage.setItem('screeningLocation', JSON.stringify(newLocation));
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

  const captureLocation = () => {
    if (isLocationPaused) {
      return;
    }
    
    if (navigator.geolocation) {
      setLocationStatus("Getting GPS location, please wait...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          setLocationStatus(`Location captured successfully!`);
          
          toast({
            title: "Location captured",
            description: `Coordinates captured successfully`,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus(`Error: ${error.message || "Failed to get location"}`);
          
          toast({
            title: "Error getting location",
            description: error.message || "Location service failed. Please try again.",
            variant: "destructive"
          });
        },
        { 
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0
        }
      );
    } else {
      setLocationStatus("Geolocation not available on this device");
      toast({
        title: "Geolocation not available",
        description: "Your browser or device does not support geolocation",
        variant: "destructive"
      });
    }
  };

  const toggleLocationPause = () => {
    setIsLocationPaused(!isLocationPaused);
    if (isLocationPaused) {
      captureLocation(); // Resume location capture
      toast({
        title: "Location tracking resumed",
        description: "Your current location will now be tracked",
      });
    } else {
      toast({
        title: "Location tracking paused",
        description: "Your location will not be updated until resumed",
      });
    }
  };

  const handleAddToBulk = () => {
    if (!formData.name || !formData.father || !formData.village) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const parsedFormData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as Gender,
      fatherOrHusband: formData.father,
      villageName: formData.village,
      conductor: screeningConductor,
      location: isLocationPaused ? undefined : locationCoords || undefined
    };

    const duplicate = checkDuplicate(parsedFormData);
    if (duplicate.exists) {
      setDuplicateEntry(duplicate);
      return;
    }

    const nextSerialNo = childScreening.length + bulkEntries.length + 1;
    
    setBulkEntries((prev) => [
      ...prev,
      {
        ...parsedFormData,
        serialNo: nextSerialNo,
        date: new Date(),
      }
    ]);
    
    // Reset only name and father fields
    setFormData(prev => ({
      ...prev,
      name: "",
      father: "",
    }));
    
    toast({
      title: "Added to Bulk Entry",
      description: "Child's data added to the bulk entry list.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.father || !formData.village) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const parsedFormData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as Gender,
      fatherOrHusband: formData.father,
      villageName: formData.village,
      conductor: screeningConductor,
      location: isLocationPaused ? undefined : locationCoords || undefined
    };

    const duplicate = checkDuplicate(parsedFormData);
    if (duplicate.exists) {
      setDuplicateEntry(duplicate);
      return;
    }

    const nextSerialNo = childScreening.length + 1;
    
    const submissionData = {
      ...parsedFormData,
      serialNo: nextSerialNo,
      date: new Date()
    };

    await addChildScreening(submissionData);
    
    // Reset only name and father fields
    setFormData(prev => ({
      ...prev,
      name: "",
      father: "",
    }));
    
    setDuplicateEntry({ exists: false });
  };

  const handleForceSubmit = async () => {
    const nextSerialNo = childScreening.length + 1;
    
    const submissionData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as Gender,
      serialNo: nextSerialNo,
      date: new Date(),
      fatherOrHusband: formData.father,
      villageName: formData.village,
      conductor: screeningConductor,
      location: isLocationPaused ? undefined : locationCoords || undefined
    };

    await addChildScreening(submissionData);
    
    // Reset only name and father fields
    setFormData(prev => ({
      ...prev,
      name: "",
      father: "",
    }));
    
    setDuplicateEntry({ exists: false });
  };

  const handleExport = (filter: 'today' | 'all' | 'sam' | 'mam' = 'today') => {
    exportData('child', filter);
  };
  
  const handleUpdateScreening = (id: string, updatedData: Partial<ChildScreeningData>) => {
    updateChildScreening(id, updatedData);
  };

  const submitBulk = () => {
    if (bulkEntries.length === 0) {
      toast({
        title: "No entries",
        description: "Please add at least one entry to the bulk list",
        variant: "destructive"
      });
      return;
    }
    
    bulkAddChildScreening(bulkEntries);
    
    toast({
      title: "Bulk submission successful",
      description: `${bulkEntries.length} entries have been saved`,
    });
    
    setBulkEntries([]);
  };

  const canEdit = currentUser?.role === 'developer' || currentUser?.role === 'master';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Child Screening</h1>
            <p className="text-muted-foreground">Record child health and nutrition data</p>
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
            <Button variant="outline" onClick={() => handleExport('sam')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export SAM Cases
            </Button>
            <Button variant="outline" onClick={() => handleExport('mam')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export MAM Cases
            </Button>
          </div>
        </div>

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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Common information for all entries in this screening session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conductor">Screening Conducted By</Label>
                <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{screeningConductor || (currentUser?.name || "Unknown")}</span>
                </div>
              </div>
              
              <ChildScreeningLocationControls
                locationStatus={locationStatus}
                locationCoords={locationCoords}
                isPaused={isLocationPaused}
                onCaptureLocation={captureLocation}
                onPauseLocation={toggleLocationPause}
              />
            </div>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2 flex items-center gap-1">
                <Building className="h-4 w-4" /> 
                Screening Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unionCouncil">Union Council *</Label>
                  <Input
                    id="unionCouncil"
                    name="unionCouncil"
                    value={formData.unionCouncil}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {duplicateEntry.exists && (
          <div className="mb-4 p-4 rounded-md border border-red-500 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-medium">Duplicate Entry Detected</p>
            </div>
            <p className="text-sm text-red-600 mt-1">
              An entry with the same Name, Father's Name, and Village already exists for today.
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleForceSubmit}>
                Force Submit
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDuplicateEntry({ exists: false })}>
                Edit Entry
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter the details of the child for screening</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="father">Father's Name *</Label>
                    <Input
                      id="father"
                      name="father"
                      value={formData.father}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Months) *</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="6"
                      max="59"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="muac">MUAC (cm) *</Label>
                    <Input
                      id="muac"
                      name="muac"
                      type="number"
                      step="0.1"
                      value={formData.muac}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value: Gender) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vaccination</Label>
                  <Select value={formData.vaccination} onValueChange={(value) => setFormData({ ...formData, vaccination: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccination status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0 - Dose">0 - Dose</SelectItem>
                      <SelectItem value="1st - Dose">1st - Dose</SelectItem>
                      <SelectItem value="2nd - Dose">2nd - Dose</SelectItem>
                      <SelectItem value="3rd - Dose">3rd - Dose</SelectItem>
                      <SelectItem value="MR - 1">MR - 1</SelectItem>
                      <SelectItem value="MR - 2">MR - 2</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dueVaccine"
                    name="dueVaccine"
                    checked={formData.dueVaccine}
                    onCheckedChange={(checked) => setFormData({ ...formData, dueVaccine: !!checked })}
                  />
                  <Label htmlFor="dueVaccine">Due Vaccine</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Any additional remarks"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Screening Images</Label>
                  <ImageCapture onImagesChange={handleImagesChange} />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" onClick={handleAddToBulk} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Bulk
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bulk Entry</CardTitle>
                <CardDescription>Add multiple child entries at once</CardDescription>
              </div>
              <Button type="button" onClick={submitBulk} disabled={bulkEntries.length === 0}>
                Save All
              </Button>
            </CardHeader>
            <CardContent>
              {bulkEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">No entries added yet. Use the form above to add entries to the bulk.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Father's Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>MUAC (cm)</TableHead>
                        <TableHead>Images</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>{entry.father}</TableCell>
                          <TableCell>{entry.age}</TableCell>
                          <TableCell>{entry.muac}</TableCell>
                          <TableCell>
                            {entry.images && entry.images.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" />
                                <span>{entry.images.length}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Screenings</CardTitle>
              <CardDescription>
                {todaysScreenings.length} screenings performed today
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleExport('today')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {todaysScreenings.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Father's Name</TableHead>
                      <TableHead>Age (Months)</TableHead>
                      <TableHead>MUAC (cm)</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>Images</TableHead>
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysScreenings.map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell>{screening.name}</TableCell>
                        <TableCell>{screening.father}</TableCell>
                        <TableCell>{screening.age}</TableCell>
                        <TableCell>{screening.muac}</TableCell>
                        <TableCell>{screening.village}</TableCell>
                        <TableCell>
                          {screening.images && screening.images.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              <span>{screening.images.length}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <EditableEntry
                              data={screening}
                              onSave={(updatedData) => handleUpdateScreening(screening.id, updatedData)}
                              title="Child Screening"
                              fieldConfig={[
                                { name: "name", label: "Name", type: "text" },
                                { name: "father", label: "Father's Name", type: "text" },
                                { name: "age", label: "Age (Months)", type: "number" },
                                { name: "muac", label: "MUAC (cm)", type: "number" },
                                { name: "village", label: "Village", type: "text" },
                                { name: "unionCouncil", label: "Union Council", type: "text" },
                                { name: "remarks", label: "Remarks", type: "text" },
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
                <h3 className="text-lg font-medium">No screenings today</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Start adding new screenings to see them appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ChildScreening;
