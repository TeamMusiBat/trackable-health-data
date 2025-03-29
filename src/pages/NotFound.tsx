
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    window.open("https://wa.me/923032939576", "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-6 text-gray-800 dark:text-gray-200">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Oops! Page not found</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="flex items-center justify-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2"
            onClick={handleWhatsAppContact}
          >
            <Phone className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
