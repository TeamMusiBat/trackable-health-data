
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AwarenessSessionData, AwarenessSessionProps } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Plus, Save, X } from 'lucide-react';
import { EditableEntry } from '@/components/EditableEntry';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { nanoid } from 'nanoid';
import { ImageCapture } from '@/components/ImageCapture';

const AwarenessSession: React.FC<AwarenessSessionProps> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { addAwarenessSession, updateAwarenessSession, awarnessSessions } = useData();

  // Detect type from URL query parameter if not provided as prop
  const sessionsType = type || new URLSearchParams(location.search).get('type') || 'fmt';
  const typeLabel = sessionsType === 'fmt' ? 'FMT' : 'Social Mobilizers';
  
  // State for form inputs
  const [serialNo, setSerialNo] = useState(1);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [name, setName] = useState("");
  const [fatherOrHusband, setFatherOrHusband] = useState("");
  const [age, setAge] = useState("");
  const [villageName, setVillageName] = useState("");
  const [ucName, setUcName] = useState("");
  const [underFiveChildren, setUnderFiveChildren] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [sameUc, setSameUc] = useState("Yes");
  const [alternateLocation, setAlternateLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{latitude: number, longitude: number, accuracy?: number} | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  // State for bulk entry
  const [bulkEntries, setBulkEntries] = useState<Omit<AwarenessSessionData, "id" | "userId" | "synced">[]>([]);
  const [activeTab, setActiveTab] = useState("single");
  const [sessionsList, setSessionsList] = useState<AwarenessSessionData[]>([]);
  
  // Load existing sessions on component mount
  useEffect(() => {
    if (awarnessSessions) {
      setSessionsList(
        awarnessSessions.filter(session => 
          session.type === (sessionsType === 'fmt' ? 'FMT' : 'Social Mobilizers')
        )
      );
    }
  }, [awarnessSessions, sessionsType]);

  // Update serial number when sessions list changes
  useEffect(() => {
    if (sessionsList.length > 0) {
      const maxSerialNo = Math.max(...sessionsList.map(session => session.serialNo));
      setSerialNo(maxSerialNo + 1);
    }
  }, [sessionsList]);

  // Capture GPS location
  const captureLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Getting GPS location",
        description: "Please wait...",
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          toast({
            title: "Location captured",
            description: `Lat: ${position.coords.latitude.toFixed(6)}, Long: ${position.coords.longitude.toFixed(6)}`,
          });
        },
        (error) => {
          toast({
            title: "Error getting location",
            description: error.message,
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      toast({
        title: "Geolocation not available",
        description: "Your browser does not support geolocation",
        variant: "destructive"
      });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setFatherOrHusband("");
    setAge("");
    setVillageName("");
    setUcName("");
    setUnderFiveChildren("");
    setContactNumber("");
    setSameUc("Yes");
    setAlternateLocation("");
    setImages([]);
    setLocationCoords(null);
    
    // Increment serial number
    setSerialNo(prevSerialNo => prevSerialNo + 1);
    setSessionNumber(prevSessionNumber => prevSessionNumber + 1);
  };

  // Handle form submission for single entry
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !fatherOrHusband || !age || !villageName) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newSession: Omit<AwarenessSessionData, "id" | "userId" | "synced"> = {
      serialNo: serialNo,
      sessionNumber: Number(sessionNumber),
      name,
      fatherOrHusband,
      age: Number(age),
      villageName,
      ucName,
      underFiveChildren: Number(underFiveChildren) || 0,
      contactNumber,
      sameUc: sameUc,
      alternateLocation,
      locationCoords: locationCoords || undefined,
      date: new Date(),
      type: sessionsType === 'fmt' ? 'FMT' : 'Social Mobilizers',
      images: [...images]
    };
    
    addAwarenessSession(newSession);
    
    toast({
      title: "Session recorded",
      description: `${typeLabel} awareness session for ${name} has been saved`,
    });
    
    resetForm();
  };

  // Add entry to bulk list
  const addToBulkEntries = () => {
    if (!name || !fatherOrHusband || !age || !villageName) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newSession: Omit<AwarenessSessionData, "id" | "userId" | "synced"> = {
      serialNo: serialNo,
      sessionNumber: Number(sessionNumber),
      name,
      fatherOrHusband,
      age: Number(age),
      villageName,
      ucName,
      underFiveChildren: Number(underFiveChildren) || 0,
      contactNumber,
      sameUc: sameUc,
      alternateLocation,
      locationCoords: locationCoords || undefined,
      date: new Date(),
      type: sessionsType === 'fmt' ? 'FMT' : 'Social Mobilizers',
      images: [...images]
    };
    
    setBulkEntries([...bulkEntries, newSession]);
    
    toast({
      title: "Added to bulk list",
      description: `${name} added to bulk entry list`,
    });
    
    resetForm();
  };

  // Submit all bulk entries
  const handleBulkSubmit = () => {
    if (bulkEntries.length === 0) {
      toast({
        title: "No entries",
        description: "Please add at least one entry to the bulk list",
        variant: "destructive"
      });
      return;
    }
    
    bulkEntries.forEach(entry => {
      addAwarenessSession(entry);
    });
    
    toast({
      title: "Bulk submission successful",
      description: `${bulkEntries.length} sessions have been saved`,
    });
    
    setBulkEntries([]);
  };

  // Remove entry from bulk list
  const removeBulkEntry = (index: number) => {
    const updatedEntries = [...bulkEntries];
    updatedEntries.splice(index, 1);
    setBulkEntries(updatedEntries);
  };

  // Handle updating a session
  const handleUpdateSession = (id: string, updatedData: Partial<AwarenessSessionData>) => {
    updateAwarenessSession(id, updatedData);
    
    toast({
      title: "Session updated",
      description: "The session information has been updated",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{typeLabel} Awareness Sessions</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>New {typeLabel} Awareness Session</CardTitle>
                <CardDescription>
                  Record a new awareness session for {typeLabel}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serialNo">Serial No</Label>
                      <Input
                        id="serialNo"
                        type="number"
                        value={serialNo}
                        onChange={(e) => setSerialNo(Number(e.target.value))}
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionNumber">Session Number</Label>
                      <Input
                        id="sessionNumber"
                        type="number"
                        value={sessionNumber}
                        onChange={(e) => setSessionNumber(Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fatherOrHusband">Father/Husband Name *</Label>
                      <Input
                        id="fatherOrHusband"
                        value={fatherOrHusband}
                        onChange={(e) => setFatherOrHusband(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="villageName">Village Name *</Label>
                      <Input
                        id="villageName"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ucName">UC Name</Label>
                      <Input
                        id="ucName"
                        value={ucName}
                        onChange={(e) => setUcName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="underFiveChildren">Under Five Children</Label>
                      <Input
                        id="underFiveChildren"
                        type="number"
                        value={underFiveChildren}
                        onChange={(e) => setUnderFiveChildren(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sameUc">Person belongs to same UC</Label>
                      <select 
                        id="sameUc"
                        value={sameUc}
                        onChange={(e) => setSameUc(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    {sameUc === "No" && (
                      <div className="space-y-2">
                        <Label htmlFor="alternateLocation">Alternate Location</Label>
                        <Input
                          id="alternateLocation"
                          value={alternateLocation}
                          onChange={(e) => setAlternateLocation(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={captureLocation}
                      >
                        Capture GPS
                      </Button>
                      {locationCoords && (
                        <span className="text-sm">
                          Lat: {locationCoords.latitude.toFixed(6)}, Long: {locationCoords.longitude.toFixed(6)}
                          {locationCoords.accuracy && ` (±${locationCoords.accuracy.toFixed(1)}m)`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Images</Label>
                    <ImageCapture
                      initialImages={images}
                      onImagesChange={setImages}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addToBulkEntries}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Bulk
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Save Session
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Entry List</CardTitle>
                <CardDescription>
                  Submit multiple awareness sessions at once
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {bulkEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No entries added yet. Add entries from the Single Entry tab.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulkEntries.map((entry, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm text-gray-500">
                              {entry.fatherOrHusband} | {entry.age} years | {entry.villageName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBulkEntry(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleBulkSubmit}>
                        <Save className="h-4 w-4 mr-2" />
                        Submit All ({bulkEntries.length})
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {sessionsList.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {sessionsList.slice(0, 4).map(session => (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Session #{session.sessionNumber}</CardTitle>
                    <CardDescription>
                      {new Date(session.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Name:</span>
                        <span>{session.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Father/Husband:</span>
                        <span>{session.fatherOrHusband}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Village:</span>
                        <span>{session.villageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Age:</span>
                        <span>{session.age}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
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
                        { name: "sameUc", label: "Person belongs to same UC", type: "text" },
                        { name: "alternateLocation", label: "Alternate Location", type: "text" },
                        { name: "images", label: "Images", type: "images" }
                      ]}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AwarenessSession;
