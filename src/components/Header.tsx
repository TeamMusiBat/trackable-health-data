
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { LocationsModal } from "@/components/LocationsModal";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MapPin, Menu, X, LogOut, Home, Users, BarChart3, Syringe, UserCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  lastActive: string;
  accuracy?: number;
}

export function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { loading: syncLoading, syncData } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSync = () => {
    syncData();
  };

  const handleShowLocations = () => {
    const mockLocations = [
      {
        name: "John Doe",
        latitude: 31.5204,
        longitude: 74.3587,
        lastActive: "10 minutes ago",
        accuracy: 10
      },
      {
        name: "Jane Smith",
        latitude: 31.5074,
        longitude: 74.3444,
        lastActive: "2 hours ago",
        accuracy: 5
      },
      {
        name: "Ahmed Khan",
        latitude: 31.5102,
        longitude: 74.3434,
        lastActive: "5 minutes ago",
        accuracy: 8
      }
    ];
    
    console.info("Research assistant locations:", mockLocations);
    setLocations(mockLocations);
    setShowLocationsModal(true);
  };
  
  const refreshLocations = () => {
    const refreshedLocations = locations.map(loc => ({
      ...loc,
      latitude: loc.latitude + (Math.random() * 0.004 - 0.002),
      longitude: loc.longitude + (Math.random() * 0.004 - 0.002),
      lastActive: "Just now",
      accuracy: Math.floor(Math.random() * 10) + 1
    }));
    
    setLocations(refreshedLocations);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="font-bold text-xl tracking-tighter">Track4Health</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated && !isMobile && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link 
                      to="/dashboard" 
                      className={location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"}
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link 
                      to="/child-screening" 
                      className={location.pathname === "/child-screening" ? "text-foreground" : "text-muted-foreground"}
                    >
                      Child Screening
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link 
                      to="/awareness-sessions" 
                      className={location.pathname.includes("/awareness") ? "text-foreground" : "text-muted-foreground"}
                    >
                      Awareness Sessions
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
          
          {isAuthenticated && (
            <>
              {(currentUser?.role === 'developer') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/user-management")}
                  className={isMobile ? "hidden" : ""}
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
                <span className="hidden sm:inline">Research Assistants</span>
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
                {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className={isMobile ? "hidden" : ""}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="ml-1"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </>
          )}
          
          {!isAuthenticated && (
            <Button size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
      
      {isMobile && mobileMenuOpen && isAuthenticated && (
        <div className="container pb-4 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b animate-fade-in">
          <nav className="flex flex-col space-y-2 pt-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={closeMobileMenu}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/child-screening" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={closeMobileMenu}
            >
              <Syringe className="h-4 w-4" />
              <span>Child Screening</span>
            </Link>
            
            <Link 
              to="/awareness-sessions" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={closeMobileMenu}
            >
              <UserCheck className="h-4 w-4" />
              <span>Awareness Sessions</span>
            </Link>
            
            {currentUser?.role === 'developer' && (
              <>
                <Link 
                  to="/user-management" 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  onClick={closeMobileMenu}
                >
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowLocations}
                  className="justify-start pl-2"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Research Assistants</span>
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncLoading}
              className="justify-start pl-2"
            >
              {syncLoading ? "Syncing..." : "Sync Data"}
            </Button>
            
            {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start pl-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            )}
          </nav>
        </div>
      )}
      
      <LocationsModal 
        open={showLocationsModal} 
        onOpenChange={setShowLocationsModal} 
        locations={locations}
        onRefresh={refreshLocations}
      />
    </header>
  );
}
