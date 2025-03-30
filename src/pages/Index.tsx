
import React from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CheckCircle, Phone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleWhatsApp = () => {
    window.open("https://wa.me/923032939576", "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Track4Health
                  </h1>
                  <p className="text-primary text-lg font-medium">
                    Monitor. Improve. Thrive.
                  </p>
                </div>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  A comprehensive health record management system designed to improve accuracy and efficiency of child screening, immunization tracking, and community awareness sessions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Digital health record management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Structured & automated data processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Smart export system with filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Works offline with automatic sync</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
                  {isAuthenticated ? (
                    <Button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/login")} className="flex items-center gap-2">
                      Login to System
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleWhatsApp}
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp Support
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex items-center justify-center">
                <img 
                  src="https://unicphscat.blob.core.windows.net/images-prd/s0145620.png" 
                  alt="UNICEF Health Worker" 
                  className="rounded-lg object-cover max-h-[400px] shadow-xl" 
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
