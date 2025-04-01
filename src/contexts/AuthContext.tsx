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
  addUser: (userData: Omit<User, 'id' | 'online' | 'lastActive'>) => Promise<boolean>;
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
  }
];

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  role: null,
  addUser: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('track4health_users');
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error('Failed to parse stored users', error);
        return initialUsers;
      }
    }
    return initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('track4health_users', JSON.stringify(users));
  }, [users]);

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

  useEffect(() => {
    let watchId: number;

    if (currentUser && navigator.geolocation) {
      const updateLocation = (position: GeolocationPosition) => {
        const updatedUser = {
          ...currentUser,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
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
    const foundUser = users.find(
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
      
      const updatedUsers = users.map(user => 
        user.id === foundUser.id ? { ...user, online: true, lastActive: new Date() } : user
      );
      setUsers(updatedUsers);
      
      toast({
        title: "Login successful",
        description: `Welcome back!`,
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
    if (currentUser?.role !== 'developer' && currentUser?.role !== 'master') {
      toast({
        title: "Action restricted",
        description: "Only administrators can logout from the system",
        variant: "destructive",
      });
      return;
    }
    
    if (currentUser) {
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? { ...user, online: false, lastActive: new Date() } : user
      );
      setUsers(updatedUsers);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('track4health_user');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const addUser = async (userData: Omit<User, 'id' | 'online' | 'lastActive'>): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'developer' && currentUser.role !== 'master')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to add users",
        variant: "destructive",
      });
      return false;
    }

    if (currentUser.role === 'master' && userData.role === 'master') {
      toast({
        title: "Permission denied",
        description: "Master users can only add FMT or Social Mobilizer users",
        variant: "destructive",
      });
      return false;
    }

    if (users.some(user => user.username === userData.username)) {
      toast({
        title: "Username already exists",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return false;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      online: false,
      lastActive: new Date(),
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    
    toast({
      title: "User created successfully",
      description: `User ${userData.name} has been added to the system`,
    });
    return true;
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || null,
    addUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
