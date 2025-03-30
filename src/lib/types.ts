
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
  age: number;
  gender: string;
  muac: number;
  district: string;
  unionCouncil: string;
  village: string;
  vaccination: string;
  dueVaccine: boolean;
  remarks: string;
  images?: string[]; // Add images field
}

// Awareness session data
export interface AwarenessSessionData extends BaseEntry {
  serialNo: number;
  name: string;
  fatherOrHusband: string;
  age: number;
  villageName: string;
  ucName: string;
  underFiveChildren: number;
  contactNumber: string;
  type: 'FMT' | 'Social Mobilizers';
  images?: string[]; // Add images field
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
  username?: string; // Optional fields to fix type errors
  password?: string;
  online?: boolean;
  lastActive?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Update AwarenessSession component props to match the casing in App.tsx
export interface AwarenessSessionProps {
  type: "fmt" | "sm";
}

// Duplicate entry check result
export interface DuplicateEntry {
  exists: boolean;
  data?: ChildScreeningData;
}

// Export options
export interface ExportOptions {
  filterSam?: boolean;
  filterMam?: boolean;
  includeImages?: boolean;
  type?: string;
  title?: string;
  workerSplit?: boolean;
}

// Editable record marker
export interface EditableRecord {
  isEditing: boolean;
  originalData: any;
}
