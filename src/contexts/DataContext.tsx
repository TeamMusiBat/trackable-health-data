
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  ChildScreeningData, 
  AwarenessSessionData,
  DuplicateEntry 
} from '@/lib/types';

interface DataContextType {
  childScreening: ChildScreeningData[];
  awarenessSessionsFMT: AwarenessSessionData[];
  awarenessSessionsSM: AwarenessSessionData[];
  addChildScreening: (data: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>) => Promise<void>;
  addAwarenessSession: (data: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>) => Promise<void>;
  bulkAddChildScreening: (dataArray: Omit<ChildScreeningData, 'id' | 'userId' | 'synced'>[]) => Promise<void>;
  bulkAddAwarenessSession: (dataArray: Omit<AwarenessSessionData, 'id' | 'userId' | 'synced'>[]) => Promise<void>;
  checkDuplicate: (data: Partial<ChildScreeningData>) => DuplicateEntry;
  syncData: () => Promise<void>;
  exportData: (type: 'child' | 'fmt' | 'sm', filter?: 'today' | 'all' | 'sam' | 'mam') => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  childScreening: [],
  awarenessSessionsFMT: [],
  awarenessSessionsSM: [],
  addChildScreening: async () => {},
  addAwarenessSession: async () => {},
  bulkAddChildScreening: async () => {},
  bulkAddAwarenessSession: async () => {},
  checkDuplicate: () => ({ exists: false }),
  syncData: async () => {},
  exportData: () => {},
  loading: false,
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childScreening, setChildScreening] = useState<ChildScreeningData[]>([]);
  const [awarenessSessionsFMT, setAwarenessSessionsFMT] = useState<AwarenessSessionData[]>([]);
  const [awarenessSessionsSM, setAwarenessSessionsSM] = useState<AwarenessSessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Load data from local storage on component mount
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

  // Save data to local storage whenever it changes
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
      synced: navigator.onLine,
    };

    setChildScreening(prev => [...prev, newEntry]);

    if (navigator.onLine) {
      // In a real app, this would be an API call to sync with the server
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
      synced: navigator.onLine,
    };

    if (data.type === 'FMT') {
      setAwarenessSessionsFMT(prev => [...prev, newEntry]);
    } else {
      setAwarenessSessionsSM(prev => [...prev, newEntry]);
    }

    if (navigator.onLine) {
      // In a real app, this would be an API call to sync with the server
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
      synced: navigator.onLine,
    }));

    setChildScreening(prev => [...prev, ...newEntries]);

    if (navigator.onLine) {
      // In a real app, this would be an API call to sync with the server
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
      synced: navigator.onLine,
    }));

    if (type === 'FMT') {
      setAwarenessSessionsFMT(prev => [...prev, ...newEntries]);
    } else {
      setAwarenessSessionsSM(prev => [...prev, ...newEntries]);
    }

    if (navigator.onLine) {
      // In a real app, this would be an API call to sync with the server
      console.log('Bulk data synced with server in real-time:', newEntries);
    } else {
      toast({
        title: "Offline mode",
        description: `${newEntries.length} records saved locally and will sync when you're back online`,
      });
    }
  };

  const syncData = async () => {
    if (!navigator.onLine) {
      toast({
        title: "Sync failed",
        description: "You are offline. Please try again when you have an internet connection.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be an API call to sync with the server
      // For now, we'll just simulate a successful sync by marking all data as synced
      
      // Update child screening data
      setChildScreening(prev => 
        prev.map(item => ({ ...item, synced: true }))
      );
      
      // Update FMT awareness sessions
      setAwarenessSessionsFMT(prev => 
        prev.map(item => ({ ...item, synced: true }))
      );
      
      // Update Social Mobilizer awareness sessions
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
    // This is a placeholder for the Excel export functionality
    // In a real app, this would use a library like SheetJS to generate Excel files
    let dataToExport: any[] = [];
    let filename = '';

    const today = new Date().toDateString();
    
    if (type === 'child') {
      let filteredData = childScreening;
      
      // Apply time filter
      if (filter === 'today') {
        filteredData = filteredData.filter(item => 
          new Date(item.date).toDateString() === today
        );
      }
      
      // Apply MUAC filters if needed
      if (filter === 'sam') {
        filteredData = filteredData.filter(item => item.muac <= 11);
      } else if (filter === 'mam') {
        filteredData = filteredData.filter(item => item.muac > 11 && item.muac <= 12);
      }
      
      dataToExport = filteredData;
      filename = `child-screening-${filter}-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'fmt') {
      const filteredData = filter === 'today' 
        ? awarenessSessionsFMT.filter(item => new Date(item.date).toDateString() === today)
        : awarenessSessionsFMT;
      
      dataToExport = filteredData;
      filename = `fmt-awareness-${filter}-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'sm') {
      const filteredData = filter === 'today' 
        ? awarenessSessionsSM.filter(item => new Date(item.date).toDateString() === today)
        : awarenessSessionsSM;
      
      dataToExport = filteredData;
      filename = `social-mobilizers-${filter}-${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    // For this demo, we just log the data that would be exported
    console.log('Exporting data:', dataToExport, 'to filename:', filename);
    
    toast({
      title: "Export started",
      description: `Exporting ${dataToExport.length} records to ${filename}`,
    });

    // In a real implementation, we'd generate and download the Excel file here
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
        checkDuplicate,
        syncData,
        exportData,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
