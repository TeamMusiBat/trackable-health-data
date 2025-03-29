
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCheck, 
  Database, 
  FileSpreadsheet, 
  MapPin, 
  Users, 
  CalendarDays, 
  AlertTriangle,
  Phone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { childScreening, awarenessSessionsFMT, awarenessSessionsSM, syncData, exportData, loading } = useData();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalChildren: 0,
    samCases: 0,
    mamCases: 0,
    normalCases: 0,
    todayEntries: 0,
    awarenessTotal: 0,
    unsyncedCount: 0,
  });

  useEffect(() => {
    const today = new Date().toDateString();
    
    // Calculate stats
    const samCases = childScreening.filter(child => child.muac <= 11).length;
    const mamCases = childScreening.filter(child => child.muac > 11 && child.muac <= 12).length;
    const normalCases = childScreening.filter(child => child.muac > 12).length;
    const todayEntries = childScreening.filter(
      item => new Date(item.date).toDateString() === today
    ).length;
    
    const awarenessTotal = awarenessSessionsFMT.length + awarenessSessionsSM.length;
    
    const unsyncedCount = 
      childScreening.filter(item => !item.synced).length + 
      awarenessSessionsFMT.filter(item => !item.synced).length + 
      awarenessSessionsSM.filter(item => !item.synced).length;

    setStats({
      totalChildren: childScreening.length,
      samCases,
      mamCases,
      normalCases,
      todayEntries,
      awarenessTotal,
      unsyncedCount,
    });
  }, [childScreening, awarenessSessionsFMT, awarenessSessionsSM]);

  // Handle field worker locations view
  const handleViewFieldWorkerLocations = () => {
    // In a real app, this would navigate to a map view or show a modal with locations
    toast({
      title: "Field Worker Locations",
      description: "This feature would display a map with all field worker locations.",
    });
    
    // For demo purposes
    if (currentUser?.role === 'developer' || currentUser?.role === 'master') {
      // Simulate location data
      const mockLocations = [
        { name: "John Doe", latitude: 31.5204, longitude: 74.3587, lastActive: "10 minutes ago" },
        { name: "Jane Smith", latitude: 31.5074, longitude: 74.3444, lastActive: "2 hours ago" },
        { name: "Ahmed Khan", latitude: 31.5102, longitude: 74.3434, lastActive: "5 minutes ago" }
      ];
      
      console.log("Field worker locations:", mockLocations);
      
      toast({
        title: "Locations Available",
        description: `${mockLocations.length} field workers' locations loaded`,
      });
    }
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    window.open("https://wa.me/923032939576", "_blank");
  };

  // Handle export actions
  const handleExportScreening = (filter: 'today' | 'all' | 'sam' | 'mam' = 'today') => {
    exportData('child', filter);
  };

  // Navigate to view SAM/MAM cases 
  const handleViewSamMamCases = () => {
    // In a real app, this might navigate to a dedicated page
    // For now, we'll just show a summary
    const samMamCases = childScreening.filter(child => child.muac <= 12);
    
    toast({
      title: `${samMamCases.length} SAM/MAM Cases Found`,
      description: `SAM: ${stats.samCases}, MAM: ${stats.mamCases}`,
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser?.username}</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === 'developer' ? 'Super Admin' : 
             currentUser?.role === 'master' ? 'Master User' : 'Field Worker'} Dashboard
          </p>
          
          {stats.unsyncedCount > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge variant="outline" className="flex gap-1 items-center">
                <AlertTriangle size={14} className="text-yellow-500" />
                {stats.unsyncedCount} records need to be synced
              </Badge>
              <Button variant="outline" size="sm" onClick={syncData} disabled={loading || !navigator.onLine}>
                <Database className="mr-2 h-4 w-4" />
                {loading ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Children Screened
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.totalChildren}</div>
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.todayEntries} new today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SAM Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.samCases}</div>
                <div className="h-6 w-6 rounded-full bg-nutrition-sam/30 flex items-center justify-center">
                  <span className="text-nutrition-sam text-xs font-bold">SAM</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {((stats.samCases / stats.totalChildren) * 100 || 0).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                MAM Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.mamCases}</div>
                <div className="h-6 w-6 rounded-full bg-nutrition-mam/30 flex items-center justify-center">
                  <span className="text-nutrition-mam text-xs font-bold">MAM</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {((stats.mamCases / stats.totalChildren) * 100 || 0).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Awareness Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.awarenessTotal}</div>
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                FMT: {awarenessSessionsFMT.length} / SM: {awarenessSessionsSM.length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Nutrition Status Overview</CardTitle>
              <CardDescription>
                Distribution of child nutrition statuses based on MUAC measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <div className="w-full">
                  <div className="flex h-4 mb-6">
                    <div 
                      className="bg-nutrition-sam" 
                      style={{ width: `${(stats.samCases / stats.totalChildren) * 100 || 0}%` }}
                    ></div>
                    <div 
                      className="bg-nutrition-mam" 
                      style={{ width: `${(stats.mamCases / stats.totalChildren) * 100 || 0}%` }}
                    ></div>
                    <div 
                      className="bg-nutrition-normal" 
                      style={{ width: `${(stats.normalCases / stats.totalChildren) * 100 || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-nutrition-sam mr-2"></div>
                        <span>SAM Cases</span>
                      </div>
                      <span className="text-2xl font-bold">{stats.samCases}</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.samCases / stats.totalChildren) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-nutrition-mam mr-2"></div>
                        <span>MAM Cases</span>
                      </div>
                      <span className="text-2xl font-bold">{stats.mamCases}</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.mamCases / stats.totalChildren) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-nutrition-normal mr-2"></div>
                        <span>Normal</span>
                      </div>
                      <span className="text-2xl font-bold">{stats.normalCases}</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.normalCases / stats.totalChildren) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportScreening('today')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Today's Screening
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleViewSamMamCases}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  View SAM/MAM Cases
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportData('fmt', 'today')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Export Awareness Sessions
                </Button>
                
                {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleViewFieldWorkerLocations}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View Field Worker Locations
                  </Button>
                )}
                
                {/* WhatsApp Contact Button - Available to all users */}
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleWhatsAppContact}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Support (WhatsApp)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
