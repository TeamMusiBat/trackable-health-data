
// Base entry types
export interface BaseEntry {
  id: string;
  userId: string;
  synced: boolean;
  date: Date;
}

// Child screening data
export interface ChildScreeningData extends BaseEntry {
  serialNo: number;
  name: string;
  father: string;
  fatherOrHusband: string; // Added to match usage in Dashboard.tsx
  age: number;
  gender: string;
  muac: number;
  district: string;
  unionCouncil: string;
  village: string;
  villageName: string; // Added to match usage in Dashboard.tsx
  vaccination: string;
  dueVaccine: boolean;
  remarks: string;
  images?: string[]; // Add images field
}

// Awareness session data
export interface AwarenessSessionData extends BaseEntry {
  serialNo: number;
  sessionNumber: number; // Added session number field
  name: string;
  fatherOrHusband: string;
  age: number;
  villageName: string;
  ucName: string;
  underFiveChildren: number;
  contactNumber: string;
  sameUc: string; // Keep as string ("Yes" or "No")
  alternateLocation?: string; // Added alternateLocation field
  locationCoords?: {  // Added location coordinates
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  type: 'FMT' | 'Social Mobilizers';
  images?: string[];
}

// User role type
export type UserRole = 'developer' | 'master' | 'admin' | 'user';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  username?: string;
  password?: string;
  online?: boolean;
  lastActive?: Date;
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

// Update AwarenessSession component props to match the casing in App.tsx
export interface AwarenessSessionProps {
  type?: "fmt" | "sm";
}

// Duplicate entry check result
export interface DuplicateEntry {
  exists: boolean;
  data?: ChildScreeningData | AwarenessSessionData;
}

// Export options
export interface ExportOptions {
  filterSam?: boolean;
  filterMam?: boolean;
  includeImages?: boolean;
  type?: string;
  title?: string;
  workerSplit?: boolean;
  removeWorkerId?: boolean;
  removeImagesColumn?: boolean;
  pakistaniTime?: boolean;
  removeDuplicates?: boolean;
}

// Editable record marker
export interface EditableRecord {
  isEditing: boolean;
  originalData: any;
}

// Input field type for form validation
export type InputFieldType = "text" | "number" | "images";
