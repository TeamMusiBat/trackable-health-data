
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="health-gradient text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col-reverse md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 mt-8 md:mt-0 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Track4Health
                </h1>
                <p className="text-lg md:text-xl mb-6">
                  A comprehensive health record management system focusing on child screening, immunization, 
                  nutrition, and hygiene awareness sessions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login">
                    <Button size="lg" className="bg-white text-health hover:bg-gray-100">
                      Login to Dashboard
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="https://i.imgur.com/001HlA0.png" 
                  alt="MUAC Tape for child nutrition screening" 
                  className="w-full max-w-md rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="h-14 w-14 rounded-full bg-health/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-health">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Child Screening</h3>
                <p className="text-muted-foreground">
                  Record and track essential child health metrics including MUAC measurements, vaccination status, and more.
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="h-14 w-14 rounded-full bg-health/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-health">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Awareness Sessions</h3>
                <p className="text-muted-foreground">
                  Manage FMT and Social Mobilizers awareness sessions to track community outreach and education efforts.
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="h-14 w-14 rounded-full bg-health/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-health">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Offline Support</h3>
                <p className="text-muted-foreground">
                  Continue working without internet access. Data automatically syncs when connection is restored.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Data Management Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8">
                <h2 className="text-3xl font-bold mb-4">Efficient Data Management</h2>
                <p className="mb-6">
                  Track4Health is designed for field workers who need to capture critical health data efficiently:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-health flex-shrink-0 mt-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Bulk data entry for multiple records at once</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-health flex-shrink-0 mt-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Structured Excel exports with color-coded nutrition status</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-health flex-shrink-0 mt-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Duplicate entry detection to prevent data errors</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-health flex-shrink-0 mt-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Real-time user location tracking for field supervision</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="bg-background dark:bg-gray-900 border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Child Screening Data</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Age</th>
                            <th className="px-4 py-2 text-left">MUAC</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="normal-row">
                            <td className="px-4 py-2">Aliya Khan</td>
                            <td className="px-4 py-2">24 months</td>
                            <td className="px-4 py-2">13.5</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-nutrition-normal/20 text-nutrition-normal rounded-full text-xs">Normal</span>
                            </td>
                          </tr>
                          <tr className="mam-row">
                            <td className="px-4 py-2">Hamza Ali</td>
                            <td className="px-4 py-2">36 months</td>
                            <td className="px-4 py-2">12.0</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-nutrition-mam/20 text-nutrition-mam rounded-full text-xs">MAM</span>
                            </td>
                          </tr>
                          <tr className="sam-row">
                            <td className="px-4 py-2">Sara Ahmed</td>
                            <td className="px-4 py-2">18 months</td>
                            <td className="px-4 py-2">10.5</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-nutrition-sam/20 text-nutrition-sam rounded-full text-xs">SAM</span>
                            </td>
                          </tr>
                          <tr className="normal-row">
                            <td className="px-4 py-2">Omar Farooq</td>
                            <td className="px-4 py-2">48 months</td>
                            <td className="px-4 py-2">14.2</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-nutrition-normal/20 text-nutrition-normal rounded-full text-xs">Normal</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
