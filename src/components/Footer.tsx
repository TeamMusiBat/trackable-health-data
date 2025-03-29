
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleWhatsApp = () => {
    window.open("https://wa.me/923032939576", "_blank");
  };

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-sm text-muted-foreground">
            © {currentYear} Track4Health. All rights reserved.
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleWhatsApp}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4Z" />
              <path d="M14 10a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4Z" />
            </svg>
            WhatsApp Support
          </Button>
        </div>
      </div>
    </footer>
  );
}
