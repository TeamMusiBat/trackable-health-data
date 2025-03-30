
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@track4health.com',
    role: 'developer',
    active: true,
    username: 'asifjamali83',
    password: 'Atifkhan83##',
    online: true,
    lastActive: new Date()
  },
];

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('track4health_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('track4health_user');
      }
    }
    setIsLoading(false);

    // Set up online/offline detection
    const updateOnlineStatus = () => {
      if (currentUser) {
        const updatedUser = { ...currentUser, online: navigator.onLine };
        setCurrentUser(updatedUser);
        localStorage.setItem('track4health_user', JSON.stringify(updatedUser));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Track user location if they're an active user
  useEffect(() => {
    let watchId: number;

    if (currentUser && navigator.geolocation) {
      const updateLocation = (position: GeolocationPosition) => {
        const updatedUser = {
          ...currentUser,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          lastActive: new Date(),
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('track4health_user', JSON.stringify(updatedUser));
      };

      watchId = navigator.geolocation.watchPosition(
        updateLocation,
        (error) => console.log('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentUser?.id]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call with proper security
    const foundUser = initialUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      const userWithStatus = {
        ...foundUser,
        online: navigator.onLine,
        lastActive: new Date(),
      };
      setCurrentUser(userWithStatus);
      localStorage.setItem('track4health_user', JSON.stringify(userWithStatus));
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      return true;
    }

    toast({
      title: "Login failed",
      description: "Invalid username or password",
      variant: "destructive",
    });
    return false;
  };

  const logout = () => {
    // Only allow developers to logout
    if (currentUser?.role !== 'developer') {
      toast({
        title: "Action restricted",
        description: "Only administrators can logout from the system",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentUser(null);
    localStorage.removeItem('track4health_user');
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
