
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

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'fieldworker' | 'developer';
  active: boolean;
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
  type?: string;
  title?: string;
}

// Editable record marker
export interface EditableRecord {
  isEditing: boolean;
  originalData: any;
}
