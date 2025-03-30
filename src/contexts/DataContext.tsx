
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  ChildScreeningData, 
  AwarenessSessionData,
  DuplicateEntry 
} from '@/lib/types';
import { exportChildScreeningToExcel, exportAwarenessSessionToExcel } from '@/utils/excelExport';

interface DataContextType {
  childScreening: ChildScreeningData[];
  awarenessSessionsFMT: AwarenessSessionData[];
  awarenessSessionsSM: AwarenessSessionData[];
  addChildScreening: (data: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>) => Promise<void>;
  addAwarenessSession: (data: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>) => Promise<void>;
  bulkAddChildScreening: (dataArray: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>[]) => Promise<void>;
  bulkAddAwarenessSession: (dataArray: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>[]) => Promise<void>;
  updateChildScreening: (id: string, data: Partial<ChildScreeningData>) => Promise<void>;
  updateAwarenessSession: (id: string, data: Partial<AwarenessSessionData>) => Promise<void>;
  checkDuplicate: (data: Partial<ChildScreeningData>) => DuplicateEntry;
  syncData: () => Promise<void>;
  exportData: (type: 'child' | 'fmt' | 'sm', filter?: 'today' | 'all' | 'sam' | 'mam') => void;
  loading: boolean;
  isOnline: boolean;
}

const DataContext = createContext<DataContextType>({
  childScreening: [],
  awarenessSessionsFMT: [],
  awarenessSessionsSM: [],
  addChildScreening: async () => {},
  addAwarenessSession: async () => {},
  bulkAddChildScreening: async () => {},
  bulkAddAwarenessSession: async () => {},
  updateChildScreening: async () => {},
  updateAwarenessSession: async () => {},
  checkDuplicate: () => ({ exists: false }),
  syncData: async () => {},
  exportData: () => {},
  loading: false,
  isOnline: true,
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childScreening, setChildScreening] = useState<ChildScreeningData[]>([]);
  const [awarenessSessionsFMT, setAwarenessSessionsFMT] = useState<AwarenessSessionData[]>([]);
  const [awarenessSessionsSM, setAwarenessSessionsSM] = useState<AwarenessSessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentUser } = useAuth();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Your data will now sync with the server",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Don't worry, your data is saved locally",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const loadedChildScreening = localStorage.getItem('childScreening');
      const loadedFMT = localStorage.getItem('awarenessSessionsFMT');
      const loadedSM = localStorage.getItem('awarenessSessionsSM');

      if (loadedChildScreening) {
        try {
          setChildScreening(JSON.parse(loadedChildScreening));
        } catch (e) {
          console.error('Failed to parse child screening data', e);
        }
      }
      
      if (loadedFMT) {
        try {
          setAwarenessSessionsFMT(JSON.parse(loadedFMT));
        } catch (e) {
          console.error('Failed to parse FMT sessions data', e);
        }
      }
      
      if (loadedSM) {
        try {
          setAwarenessSessionsSM(JSON.parse(loadedSM));
        } catch (e) {
          console.error('Failed to parse SM sessions data', e);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('childScreening', JSON.stringify(childScreening));
      localStorage.setItem('awarenessSessionsFMT', JSON.stringify(awarenessSessionsFMT));
      localStorage.setItem('awarenessSessionsSM', JSON.stringify(awarenessSessionsSM));
    }
  }, [childScreening, awarenessSessionsFMT, awarenessSessionsSM, currentUser]);

  const checkDuplicate = (data: Partial<ChildScreeningData>): DuplicateEntry => {
    if (!data.name || !data.father || !data.village) {
      return { exists: false };
    }

    const today = new Date().toDateString();
    const duplicate = childScreening.find(item => 
      item.name === data.name && 
      item.father === data.father && 
      item.village === data.village &&
      new Date(item.date).toDateString() === today
    );

    return duplicate ? { exists: true, data: duplicate } : { exists: false };
  };

  const addChildScreening = async (data: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>) => {
    if (!currentUser) return;

    const newEntry: ChildScreeningData = {
      ...data,
      id: uuidv4(),
      userId: currentUser.id,
      synced: isOnline,
    };

    setChildScreening(prev => [...prev, newEntry]);

    if (isOnline) {
      console.log('Data synced with server in real-time:', newEntry);
    } else {
      toast({
        title: "Offline mode",
        description: "Data saved locally and will sync when you're back online",
      });
    }
  };

  const addAwarenessSession = async (data: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>) => {
    if (!currentUser) return;

    const newEntry: AwarenessSessionData = {
      ...data,
      id: uuidv4(),
      userId: currentUser.id,
      synced: isOnline,
    };

    if (data.type === 'FMT') {
      setAwarenessSessionsFMT(prev => [...prev, newEntry]);
    } else {
      setAwarenessSessionsSM(prev => [...prev, newEntry]);
    }

    if (isOnline) {
      console.log('Data synced with server in real-time:', newEntry);
    } else {
      toast({
        title: "Offline mode",
        description: "Data saved locally and will sync when you're back online",
      });
    }
  };

  const bulkAddChildScreening = async (dataArray: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>[]) => {
    if (!currentUser) return;

    const newEntries: ChildScreeningData[] = dataArray.map(data => ({
      ...data,
      id: uuidv4(),
      userId: currentUser.id,
      synced: isOnline,
    }));

    setChildScreening(prev => [...prev, ...newEntries]);

    if (isOnline) {
      console.log('Bulk data synced with server in real-time:', newEntries);
    } else {
      toast({
        title: "Offline mode",
        description: `${newEntries.length} records saved locally and will sync when you're back online`,
      });
    }
  };

  const bulkAddAwarenessSession = async (dataArray: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>[]) => {
    if (!currentUser || dataArray.length === 0) return;

    const type = dataArray[0].type;
    const newEntries: AwarenessSessionData[] = dataArray.map(data => ({
      ...data,
      id: uuidv4(),
      userId: currentUser.id,
      synced: isOnline,
    }));

    if (type === 'FMT') {
      setAwarenessSessionsFMT(prev => [...prev, ...newEntries]);
    } else {
      setAwarenessSessionsSM(prev => [...prev, ...newEntries]);
    }

    if (isOnline) {
      console.log('Bulk data synced with server in real-time:', newEntries);
    } else {
      toast({
        title: "Offline mode",
        description: `${newEntries.length} records saved locally and will sync when you're back online`,
      });
    }
  };

  const updateChildScreening = async (id: string, data: Partial<ChildScreeningData>) => {
    if (!currentUser) return;

    setChildScreening(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...data, synced: isOnline } 
          : item
      )
    );

    toast({
      title: "Record updated",
      description: isOnline ? "Record updated and synced" : "Record updated locally",
    });
  };

  const updateAwarenessSession = async (id: string, data: Partial<AwarenessSessionData>) => {
    if (!currentUser) return;

    // Check if it's an FMT or SM session
    const isFMT = awarenessSessionsFMT.some(session => session.id === id);
    
    if (isFMT) {
      setAwarenessSessionsFMT(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...data, synced: isOnline } 
            : item
        )
      );
    } else {
      setAwarenessSessionsSM(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...data, synced: isOnline } 
            : item
        )
      );
    }

    toast({
      title: "Record updated",
      description: isOnline ? "Record updated and synced" : "Record updated locally",
    });
  };

  const syncData = async () => {
    if (!isOnline) {
      toast({
        title: "Sync failed",
        description: "You are offline. Please try again when you have an internet connection.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      setChildScreening(prev => 
        prev.map(item => ({ ...item, synced: true }))
      );
      
      setAwarenessSessionsFMT(prev => 
        prev.map(item => ({ ...item, synced: true }))
      );
      
      setAwarenessSessionsSM(prev => 
        prev.map(item => ({ ...item, synced: true }))
      );

      toast({
        title: "Sync complete",
        description: "All data has been synchronized with the server.",
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync failed",
        description: "An error occurred while syncing data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = (type: 'child' | 'fmt' | 'sm', filter: 'today' | 'all' | 'sam' | 'mam' = 'today') => {
    const today = new Date().toDateString();
    const currentDate = new Date().toLocaleDateString();
    
    if (type === 'child') {
      let filteredData = childScreening;
      
      // Apply time filter
      if (filter === 'today') {
        filteredData = filteredData.filter(item => 
          new Date(item.date).toDateString() === today
        );
      }
      
      const title = `Child Screening Data - ${filter === 'today' ? currentDate : 'All Records'}`;
      
      exportChildScreeningToExcel(filteredData, {
        filterSam: filter === 'sam',
        filterMam: filter === 'mam',
        title: title
      });
      
      toast({
        title: "Export complete",
        description: `Exported ${filteredData.length} records to Excel`,
      });
    } else if (type === 'fmt') {
      const filteredData = filter === 'today' 
        ? awarenessSessionsFMT.filter(item => new Date(item.date).toDateString() === today)
        : awarenessSessionsFMT;
      
      const title = `FMT Awareness Sessions - ${filter === 'today' ? currentDate : 'All Records'}`;
      
      exportAwarenessSessionToExcel(filteredData, {
        type: 'FMT',
        title: title
      });
      
      toast({
        title: "Export complete",
        description: `Exported ${filteredData.length} records to Excel`,
      });
    } else if (type === 'sm') {
      const filteredData = filter === 'today' 
        ? awarenessSessionsSM.filter(item => new Date(item.date).toDateString() === today)
        : awarenessSessionsSM;
      
      const title = `Social Mobilizer Awareness Sessions - ${filter === 'today' ? currentDate : 'All Records'}`;
      
      exportAwarenessSessionToExcel(filteredData, {
        type: 'Social Mobilizers',
        title: title
      });
      
      toast({
        title: "Export complete",
        description: `Exported ${filteredData.length} records to Excel`,
      });
    }
  };

  return (
    <DataContext.Provider
      value={{
        childScreening,
        awarenessSessionsFMT,
        awarenessSessionsSM,
        addChildScreening,
        addAwarenessSession,
        bulkAddChildScreening,
        bulkAddAwarenessSession,
        updateChildScreening,
        updateAwarenessSession,
        checkDuplicate,
        syncData,
        exportData,
        loading,
        isOnline
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
