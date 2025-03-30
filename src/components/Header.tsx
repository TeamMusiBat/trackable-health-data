import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { LocationsModal } from "@/components/LocationsModal";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MapPin } from "./ui/icons";

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
}

export function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { loading: syncLoading, syncData } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSync = () => {
    syncData();
  };

  const handleShowLocations = () => {
    // In a real app, this would fetch from an API
    const mockLocations = [
      {
        name: "John Doe",
        latitude: 31.5204,
        longitude: 74.3587,
        lastActive: "10 minutes ago"
      },
      {
        name: "Jane Smith",
        latitude: 31.5074,
        longitude: 74.3444,
        lastActive: "2 hours ago"
      },
      {
        name: "Ahmed Khan",
        latitude: 31.5102,
        longitude: 74.3434,
        lastActive: "5 minutes ago"
      }
    ];
    
    console.info("Field worker locations:", mockLocations);
    setLocations(mockLocations);
    setShowLocationsModal(true);
  };
  
  const refreshLocations = () => {
    // This would normally fetch fresh data from an API
    // Simulating a refresh with slight location changes
    const refreshedLocations = locations.map(loc => ({
      ...loc,
      latitude: loc.latitude + (Math.random() * 0.004 - 0.002),
      longitude: loc.longitude + (Math.random() * 0.004 - 0.002),
      lastActive: "Just now"
    }));
    
    setLocations(refreshedLocations);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tighter">Track4Health</span>
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/child-screening" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/child-screening" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Child Screening
              </Link>
              <Link 
                to="/fmt-awareness" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/fmt-awareness" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                FMT Sessions
              </Link>
              <Link 
                to="/sm-awareness" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/sm-awareness" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                SM Sessions
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated && (
            <>
              {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/user-management")}
                >
                  Manage Users
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowLocations}
                className="flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Field Workers</span>
              </Button>
              
              <Button
                variant={syncLoading ? "outline" : "secondary"}
                size="sm"
                onClick={handleSync}
                disabled={syncLoading}
                className="hidden sm:flex"
              >
                {syncLoading ? "Syncing..." : "Sync Data"}
              </Button>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                {currentUser?.role === 'developer' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </>
          )}
          
          {!isAuthenticated && (
            <Button size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
      
      <LocationsModal 
        open={showLocationsModal} 
        onOpenChange={setShowLocationsModal} 
        locations={locations}
        onRefresh={refreshLocations}
      />
    </header>
  );
}
