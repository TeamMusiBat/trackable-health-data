import React from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track4Health
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  A comprehensive health tracking system for field workers.
                  Monitor child nutrition, vaccination status, and community
                  awareness sessions.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isAuthenticated ? (
                    <Button onClick={() => navigate("/dashboard")}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/login")}>
                      Login to System
                    </Button>
                  )}
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
