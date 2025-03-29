
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { FileSpreadsheet, Plus, AlertTriangle, MapPin, Building } from "lucide-react";

const ChildScreening = () => {
  const { isAuthenticated } = useAuth();
  const { childScreening, addChildScreening, bulkAddChildScreening, checkDuplicate, exportData } = useData();

  const [formData, setFormData] = useState({
    name: "",
    father: "",
    age: "", // Changed from 0 to empty string
    gender: "Male" as const, // Using as const to fix the type
    muac: "", // Changed from 0 to empty string
    district: "",
    unionCouncil: "",
    village: "",
    vaccination: "0 - Dose",
    dueVaccine: false,
    remarks: "",
  });
  const [bulkEntries, setBulkEntries] = useState<Array<Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>>>([]);
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  const [duplicateEntry, setDuplicateEntry] = useState<DuplicateEntry>({ exists: false });

  // Add location state management:
  const storedLocation = localStorage.getItem('screeningLocation');
  let parsedLocation = { district: "", unionCouncil: "", village: "" };

  if (storedLocation) {
    try {
      parsedLocation = JSON.parse(storedLocation);
    } catch (e) {
      console.error('Failed to parse stored location', e);
    }
  }

  // Update initial form state:
  const initialFormState = {
    name: "",
    father: "",
    age: "", // Changed from 0 to empty string
    gender: "Male" as const, // Using as const to fix the type
    muac: "", // Changed from 0 to empty string
    district: parsedLocation.district || "",
    unionCouncil: parsedLocation.unionCouncil || "",
    village: parsedLocation.village || "",
    vaccination: "0 - Dose",
    dueVaccine: false,
    remarks: "",
  };

  // Add a locationSet state:
  const [locationSet, setLocationSet] = useState(
    !!(parsedLocation.district && parsedLocation.unionCouncil && parsedLocation.village)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'age' || name === 'muac') {
      // Remove leading zeros for numeric fields
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
      
      // Update location in localStorage when location fields change
      if (['district', 'unionCouncil', 'village'].includes(name)) {
        const newLocation = {
          district: name === 'district' ? value : formData.district,
          unionCouncil: name === 'unionCouncil' ? value : formData.unionCouncil,
          village: name === 'village' ? value : formData.village
        };
        
        // Only save if all fields have values
        if (newLocation.district && newLocation.unionCouncil && newLocation.village) {
          localStorage.setItem('screeningLocation', JSON.stringify(newLocation));
          setLocationSet(true);
        }
      }
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

    // Convert age and muac to numbers for type checking
    const parsedFormData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as "Male" | "Female" | "Other", // Ensure correct type
    };

    const duplicate = checkDuplicate(parsedFormData);
    if (duplicate.exists) {
      setDuplicateEntry(duplicate);
      return;
    }

    // Get the next serial number
    const nextSerialNo = childScreening.length + bulkEntries.length + 1;
    
    setBulkEntries((prev) => [
      ...prev,
      {
        ...parsedFormData,
        serialNo: nextSerialNo,
        date: new Date(),
      }
    ]);
    
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });
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

    // Convert age and muac to numbers for type checking
    const parsedFormData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as "Male" | "Female" | "Other", // Ensure correct type
    };

    const duplicate = checkDuplicate(parsedFormData);
    if (duplicate.exists) {
      setDuplicateEntry(duplicate);
      return;
    }

    // Get the next serial number
    const nextSerialNo = childScreening.length + 1;
    
    const submissionData = {
      ...parsedFormData,
      serialNo: nextSerialNo,
      date: new Date()
    };

    await addChildScreening(submissionData);
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });
    setDuplicateEntry({ exists: false });
  };

  const handleBulkSubmit = async () => {
    if (bulkEntries.length === 0) {
      toast({
        title: "No Entries",
        description: "Please add entries to the bulk submit list.",
        variant: "destructive",
      });
      return;
    }

    // Validate each entry for duplicates before submission
    for (const entry of bulkEntries) {
      const duplicate = checkDuplicate(entry);
      if (duplicate.exists) {
        toast({
          title: "Duplicate Entry Found",
          description: `Entry for ${entry.name} already exists. Please review.`,
          variant: "destructive",
        });
        return; // Stop submission if any duplicate is found
      }
    }

    // If all entries are unique, proceed with submission
    await bulkAddChildScreening(bulkEntries);
    setBulkEntries([]);
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });
    setIsBulkEntry(false);
    toast({
      title: "Bulk Entries Saved",
      description: "All child screening entries have been saved.",
    });
  };

  const handleForceSubmit = async () => {
    // Get the next serial number
    const nextSerialNo = childScreening.length + 1;
    
    const submissionData = {
      ...formData,
      age: formData.age === '' ? 0 : parseFloat(String(formData.age)),
      muac: formData.muac === '' ? 0 : parseFloat(String(formData.muac)),
      gender: formData.gender as "Male" | "Female" | "Other", // Ensure correct type
      serialNo: nextSerialNo,
      date: new Date()
    };

    await addChildScreening(submissionData);
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });
    setDuplicateEntry({ exists: false });
  };

  const handleExport = (filter: 'today' | 'all' | 'sam' | 'mam' = 'today') => {
    exportData('child', filter);
  };

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

        <div className={`mb-6 p-4 rounded-lg border ${locationSet ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
          <div className="flex items-center gap-2">
            <MapPin className={locationSet ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} />
            <div className="font-medium text-lg">
              Current Location: {locationSet ? `${formData.village}, ${formData.unionCouncil}, ${formData.district}` : 'Please set location'}
            </div>
          </div>
          {locationSet && (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>All new entries will be recorded at this location</span>
            </div>
          )}
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Child Information</CardTitle>
            <CardDescription>Enter the details of the child for screening</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-muted p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> 
                  Screening Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
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
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bulk Entry</CardTitle>
              <CardDescription>Add multiple child entries at once</CardDescription>
            </div>
            <Button type="button" onClick={handleBulkSubmit} disabled={bulkEntries.length === 0}>
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
                      <TableHead>Vaccination</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>{entry.father}</TableCell>
                        <TableCell>{entry.age}</TableCell>
                        <TableCell>{entry.muac}</TableCell>
                        <TableCell>{entry.vaccination}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
