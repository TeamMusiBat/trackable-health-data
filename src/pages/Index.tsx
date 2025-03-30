
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, CalendarDays, FileSpreadsheet, Database, Phone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const handleWhatsAppContact = () => {
    window.open("https://wa.me/923032939576", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Track4Health
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Monitor. Improve. Thrive.
                  </p>
                </div>
                <div className="space-y-6 text-muted-foreground">
                  <p className="leading-7">
                    Track4Health is a comprehensive health record management system focused on
                    child screening, immunization, nutrition, and hygiene awareness sessions.
                  </p>
                  <p className="leading-7">
                    Our platform enables efficient bulk data entry, structured Excel exports,
                    and real-time user tracking, making health monitoring more accessible and
                    effective for communities.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/login")}
                  >
                    Login to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto" 
                    onClick={handleWhatsAppContact}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://unicphscat.blob.core.windows.net/images-prd/s0145620.png"
                  width={500}
                  height={400}
                  alt="Health Screening"
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Key Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our comprehensive platform is designed to streamline health monitoring and data collection.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 md:mt-12">
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Child Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Record and track nutritional status with MUAC measurements and vaccination history.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mb-3">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Awareness Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track FMT and Social Mobilizer awareness sessions with participant details.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mb-3">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Data Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate structured Excel exports with color-coded health indicators.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mb-3">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Offline Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Work without internet connectivity with automatic sync when reconnected.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
