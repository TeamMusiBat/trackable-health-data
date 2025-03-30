
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { RequireAuth } from "./components/RequireAuth";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChildScreening from "./pages/ChildScreening";
import AwarenessSession from "./pages/AwarenessSession";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

// Create a client with explicit configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Fixed App component using proper React functional component pattern
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <DataProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  } />
                  <Route path="/child-screening" element={
                    <RequireAuth>
                      <ChildScreening />
                    </RequireAuth>
                  } />
                  <Route path="/fmt-awareness" element={
                    <RequireAuth>
                      <AwarenessSession type="fmt" />
                    </RequireAuth>
                  } />
                  <Route path="/sm-awareness" element={
                    <RequireAuth>
                      <AwarenessSession type="sm" />
                    </RequireAuth>
                  } />
                  <Route path="/user-management" element={
                    <RequireAuth>
                      <UserManagement />
                    </RequireAuth>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DataProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
