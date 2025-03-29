
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/child-screening" className="hover:text-primary transition-colors">
            Child Screening
          </Link>
          <Link to="/fmt-awareness" className="hover:text-primary transition-colors">
            FMT Awareness
          </Link>
          <Link to="/sm-awareness" className="hover:text-primary transition-colors">
            SM Awareness
          </Link>
          {(currentUser?.role === 'developer' || currentUser?.role === 'master') && (
            <Link to="/user-management" className="hover:text-primary transition-colors">
              User Management
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Track4Health</SheetTitle>
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
              <span className="font-bold text-xl">Track4Health</span>
              <span className="text-xs text-muted-foreground">Monitor. Improve. Thrive.</span>
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
              
              <Button variant="ghost" className="flex gap-2" onClick={logout}>
                <User size={18} />
                <span className="hidden sm:inline">{currentUser?.username}</span>
                <LogOut size={18} className="sm:ml-1" />
              </Button>
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
