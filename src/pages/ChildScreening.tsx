import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { FileSpreadsheet, Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildScreeningData } from "@/lib/types";

interface ChildFormData {
  serialNo: number;
  name: string;
  father: string;
  age: number;
  muac: number;
  gender: "Male" | "Female" | "Other";
  district: string;
  unionCouncil: string;
  village: string;
  vaccination: string;
  dueVaccine: boolean;
  remarks: string;
}

const initialFormState: ChildFormData = {
  serialNo: 1,
  name: "",
  father: "",
  age: 6,
  muac: 12.5,
  gender: "Male",
  district: "",
  unionCouncil: "",
  village: "",
  vaccination: "0 - Dose",
  dueVaccine: false,
  remarks: "",
};

const ChildScreening = () => {
  const { isAuthenticated } = useAuth();
  const { 
    childScreening,
    addChildScreening, 
    bulkAddChildScreening,
    checkDuplicate,
    exportData 
  } = useData();

  const [formData, setFormData] = useState<ChildFormData>(initialFormState);
  const [bulkEntries, setBulkEntries] = useState<ChildFormData[]>([]);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateData, setDuplicateData] = useState<ChildFormData | null>(null);

  // Get today's data for display in Today's Entries tab
  const today = new Date().toDateString();
  const todaysEntries = childScreening.filter(
    entry => new Date(entry.date).toDateString() === today
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleAddToBulk = () => {
    if (!formData.name || !formData.father || !formData.village) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate entry
    const duplicateResult = checkDuplicate(formData);
    if (duplicateResult.exists) {
      setDuplicateData(formData);
      setShowDuplicateAlert(true);
      return;
    }

    // Add to bulk entries
    setBulkEntries([
      ...bulkEntries,
      { ...formData, serialNo: bulkEntries.length + 1 },
    ]);
    
    // Reset form but keep district, union council and village
    setFormData({
      ...initialFormState,
      serialNo: bulkEntries.length + 2,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });

    toast({
      title: "Entry added",
      description: "Child added to bulk entry list",
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
    
    if (!formData.name || !formData.father || !formData.village) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate entry
    const duplicateResult = checkDuplicate(formData);
    if (duplicateResult.exists) {
      setDuplicateData(formData);
      setShowDuplicateAlert(true);
      return;
    }

    // Calculate remarks based on MUAC
    let remarks = formData.remarks;
    if (!remarks) {
      if (formData.muac <= 11) {
        remarks = "SAM";
      } else if (formData.muac <= 12) {
        remarks = "MAM";
      } else {
        remarks = "Normal";
      }
    }

    // Add single entry
    await addChildScreening({
      ...formData,
      date: new Date(),
      remarks,
    });

    // Reset form but keep district, union council and village
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });

    toast({
      title: "Entry saved",
      description: "Child screening data has been saved",
    });
  };

  const handleBulkSubmit = async () => {
    if (bulkEntries.length === 0) {
      toast({
        title: "No entries",
        description: "Please add at least one child to the bulk entry list",
        variant: "destructive",
      });
      return;
    }

    // Process each entry to add calculated remarks based on MUAC
    const processedEntries = bulkEntries.map(entry => {
      let remarks = entry.remarks;
      if (!remarks) {
        if (entry.muac <= 11) {
          remarks = "SAM";
        } else if (entry.muac <= 12) {
          remarks = "MAM";
        } else {
          remarks = "Normal";
        }
      }
      
      return {
        ...entry,
        date: new Date(),
        remarks,
      };
    });

    // Bulk submit
    await bulkAddChildScreening(processedEntries);
    
    // Reset bulk entries and form
    setBulkEntries([]);
    setFormData({
      ...initialFormState,
      district: formData.district,
      unionCouncil: formData.unionCouncil,
      village: formData.village,
    });

    toast({
      title: "Bulk entries saved",
      description: `${processedEntries.length} children have been saved`,
    });
  };

  const handleForceSubmit = async () => {
    if (!duplicateData) return;
    
    // Calculate remarks based on MUAC
    let remarks = duplicateData.remarks;
    if (!remarks) {
      if (duplicateData.muac <= 11) {
        remarks = "SAM";
      } else if (duplicateData.muac <= 12) {
        remarks = "MAM";
      } else {
        remarks = "Normal";
      }
    }
    
    // Force submit despite duplication warning
    await addChildScreening({
      ...duplicateData,
      date: new Date(),
      remarks,
    });
    
    setShowDuplicateAlert(false);
    setDuplicateData(null);
    
    // Reset form but keep district, union council and village
    setFormData({
      ...initialFormState,
      district: duplicateData.district,
      unionCouncil: duplicateData.unionCouncil,
      village: duplicateData.village,
    });

    toast({
      title: "Entry forced",
      description: "Duplicate child screening data has been saved",
    });
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
      
      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Entry Detected</AlertDialogTitle>
            <AlertDialogDescription>
              A child with the same name, father's name, and village already exists for today's date.
              Do you want to edit your entry or force submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Edit Entry</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceSubmit}>Force Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Child Screening</h1>
            <p className="text-muted-foreground">
              Record child health metrics and nutrition status
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
        
        <Tabs defaultValue="entry">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="entry">Data Entry</TabsTrigger>
            <TabsTrigger value="today">Today's Entries ({todaysEntries.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Child Information</CardTitle>
                  <CardDescription>
                    Enter child screening information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="name">Child Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="father">Father Name *</Label>
                      <Input
                        id="father"
                        name="father"
                        value={formData.father}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age (6-59 months) *</Label>
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
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="muac">MUAC (cm) *</Label>
                      <Input
                        id="muac"
                        name="muac"
                        type="number"
                        step="0.1"
                        min="6"
                        max="20"
                        value={formData.muac}
                        onChange={handleInputChange}
                        required
                        className={
                          formData.muac <= 11
                            ? "border-nutrition-sam"
                            : formData.muac <= 12
                            ? "border-nutrition-mam"
                            : "border-nutrition-normal"
                        }
                      />
                      <div className="text-xs text-muted-foreground">
                        Status: 
                        <span 
                          className={
                            formData.muac <= 11
                              ? "ml-1 text-nutrition-sam font-medium"
                              : formData.muac <= 12
                              ? "ml-1 text-nutrition-mam font-medium"
                              : "ml-1 text-nutrition-normal font-medium"
                          }
                        >
                          {formData.muac <= 11 ? "SAM" : formData.muac <= 12 ? "MAM" : "Normal"}
                        </span>
                      </div>
                    </div>
                    
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="vaccination">Vaccination *</Label>
                      <Select
                        name="vaccination"
                        value={formData.vaccination}
                        onValueChange={(value) => handleSelectChange("vaccination", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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
                        checked={formData.dueVaccine}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("dueVaccine", checked as boolean)
                        }
                      />
                      <Label htmlFor="dueVaccine">Due Vaccine</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Input
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Optional"
                      />
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
                      {bulkEntries.length} children ready for submission
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
                            <TableHead>Age</TableHead>
                            <TableHead>MUAC</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkEntries.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{entry.serialNo}</TableCell>
                              <TableCell className="font-medium">{entry.name}</TableCell>
                              <TableCell>{entry.age} months</TableCell>
                              <TableCell>{entry.muac}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    entry.muac <= 11
                                      ? "bg-nutrition-sam/20 text-nutrition-sam"
                                      : entry.muac <= 12
                                      ? "bg-nutrition-mam/20 text-nutrition-mam"
                                      : "bg-nutrition-normal/20 text-nutrition-normal"
                                  }`}
                                >
                                  {entry.muac <= 11 ? "SAM" : entry.muac <= 12 ? "MAM" : "Normal"}
                                </span>
                              </TableCell>
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
                        Add children to the bulk entry list using the form on the left.
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
                  <CardTitle>Today's Entries</CardTitle>
                  <CardDescription>
                    {todaysEntries.length} children screened today
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExport('today')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {todaysEntries.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">S/No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Father</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>MUAC</TableHead>
                          <TableHead>Village</TableHead>
                          <TableHead>Vaccination</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todaysEntries.map((entry, index) => (
                          <TableRow 
                            key={entry.id}
                            className={
                              entry.muac <= 11
                                ? "sam-row"
                                : entry.muac <= 12
                                ? "mam-row"
                                : "normal-row"
                            }
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>{entry.father}</TableCell>
                            <TableCell>{entry.age} months</TableCell>
                            <TableCell>{entry.gender}</TableCell>
                            <TableCell>{entry.muac}</TableCell>
                            <TableCell>{entry.village}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {entry.vaccination}
                              {entry.dueVaccine && (
                                <span className="ml-1 inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  entry.muac <= 11
                                    ? "bg-nutrition-sam/20 text-nutrition-sam"
                                    : entry.muac <= 12
                                    ? "bg-nutrition-mam/20 text-nutrition-mam"
                                    : "bg-nutrition-normal/20 text-nutrition-normal"
                                }`}
                              >
                                {entry.muac <= 11 ? "SAM" : entry.muac <= 12 ? "MAM" : "Normal"}
                              </span>
                            </TableCell>
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
                    <h3 className="text-lg font-medium">No entries today</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Start adding child screening data to see them appear here.
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

export default ChildScreening;
