
export type UserRole = 'developer' | 'master' | 'user';

export interface User {
  id: string;
  username: string;
  password: string; // This should be hashed in a real implementation
  role: UserRole;
  online?: boolean;
  lastActive?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ChildScreeningData {
  id: string;
  serialNo: number;
  date: Date;
  name: string;
  father: string;
  age: number;
  muac: number;
  gender: 'Male' | 'Female' | 'Other';
  district: string;
  unionCouncil: string;
  village: string;
  vaccination: string;
  dueVaccine: boolean;
  remarks: string;
  userId: string;
  synced: boolean;
}

export interface AwarenessSessionData {
  id: string;
  type: 'FMT' | 'Social Mobilizers';
  serialNo: number;
  name: string;
  fatherOrHusband: string;
  date: Date;
  villageName: string;
  ucName: string;
  age: number;
  underFiveChildren: number;
  contactNumber: string;
  userId: string;
  synced: boolean;
}

export interface DuplicateEntry {
  exists: boolean;
  data?: ChildScreeningData | AwarenessSessionData;
}
