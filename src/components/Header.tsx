
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary font-medium" : "text-foreground/80";
  };

  const NavItems = () => (
    <>
      {isAuthenticated && (
        <>
          <Link 
            to="/dashboard" 
            className={`${isActive('/dashboard')} hover:text-primary transition-colors`}
          >
            Dashboard
          </Link>
          <Link 
            to="/child-screening" 
            className={`${isActive('/child-screening')} hover:text-primary transition-colors`}
          >
            Child Screening
          </Link>
          <Link 
            to="/fmt-awareness" 
            className={`${isActive('/fmt-awareness')} hover:text-primary transition-colors`}
          >
            FMT Awareness
          </Link>
          <Link 
            to="/sm-awareness" 
            className={`${isActive('/sm-awareness')} hover:text-primary transition-colors`}
          >
            SM Awareness
          </Link>
          {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
            <Link 
              to="/user-management" 
              className={`${isActive('/user-management')} hover:text-primary transition-colors`}
            >
              User Management
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-primary">Track4Health</SheetTitle>
                <SheetDescription>
                  Monitor. Improve. Thrive.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="font-bold text-xl">
                <span className="text-primary">Track</span>4Health
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">Monitor. Improve. Thrive.</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <NavItems />
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Badge variant={currentUser?.online ? "default" : "outline"} className="hidden sm:flex gap-1">
                <div className={`w-2 h-2 rounded-full ${currentUser?.online ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                {currentUser?.online ? "Online" : "Offline"}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User size={18} />
                    <span className="hidden sm:inline">{currentUser?.username}</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
