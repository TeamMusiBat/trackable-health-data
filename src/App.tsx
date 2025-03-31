import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ChildScreening from "@/pages/ChildScreening";
import AwarenessSession from "@/pages/AwarenessSession";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/NotFound";
import { RequireAuth } from '@/components/RequireAuth';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <DataProvider>
            <Router>
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
                
                <Route path="/awareness-sessions" element={
                  <RequireAuth>
                    <AwarenessSession />
                  </RequireAuth>
                } />
                
                <Route path="/fmt-awareness" element={
                  <RequireAuth>
                    <Navigate to="/awareness-sessions?type=fmt" replace />
                  </RequireAuth>
                } />
                
                <Route path="/sm-awareness" element={
                  <RequireAuth>
                    <Navigate to="/awareness-sessions?type=sm" replace />
                  </RequireAuth>
                } />
                
                <Route path="/user-management" element={
                  <RequireAuth>
                    <UserManagement />
                  </RequireAuth>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
