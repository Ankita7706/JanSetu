export type Role = 'citizen' | 'government' | 'official';

export type RequestStatus = 'pending' | 'new' | 'assigned' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'high' | 'medium' | 'low';

export type Category =
  | 'Roads'
  | 'Water'
  | 'Streetlights'
  | 'Drainage'
  | 'Public Transport'
  | 'Schools & Hospitals'
  | 'Electricity'
  | 'Sanitation'
  | 'Digital Infrastructure'
  | 'Other Development';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
  language: string;
  avatar?: string;
  phone?: string;
  mobile?: string;
  bio?: string;
  organization?: string;
  // Government Employee Profile Fields
  employeeId?: string;
  department?: string;
  designation?: string;
  state?: string;
  district?: string;
}

export interface AIAnalysis {
  detectedLanguage: string;
  originalText: string;
  translatedText: string;
  category: Category;
  subcategory: string;
  severity: Severity;
  summary: string;
  confidence: number;
  keywords: string[];
  duplicateClusterCount?: number;
}

export interface OfficialResponse {
  message: string;
  updatedAt: string;
  officialName: string;
  officialRole?: string;
  estimatedResolution?: string;
}

export interface RequestLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface CitizenRequest {
  id: string;
  userId: string;
  userName?: string;
  category: Category;
  description: string;
  location: string;
  locationDetails?: RequestLocation;
  coordinates?: { lat: number; lng: number };
  language: string;
  imageUrl?: string;
  status: RequestStatus;
  priority?: PriorityLevel;
  affectedCount?: number;
  createdAt: string;
  updatedAt: string;
  aiAnalysis: AIAnalysis;
  isVoice?: boolean;
  voiceTranscription?: string;
  officialResponse?: OfficialResponse;
  // Automatic routing fields: Category -> Department -> Region -> Officer
  department?: string;
  region?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerDesignation?: string;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  population: number;
  populationDensity: number;
  infrastructureIndex: number;
  roadCoverage: number;
  healthcareFacilities: number;
  educationFacilities: number;
  waterAccess: number;
  digitalConnectivity: number;
  publicInvestment: number;
  citizenDemand: number;
  requestCount: number;
  infrastructureGap: number;
  populationImpact: number;
  investmentGap: number;
  priorityScore: number;
  lat: number;
  lng: number;
  topCategory?: Category;
  resolvedCount?: number;
}

export interface Hotspot {
  id: string;
  name: string;
  region: string;
  category: Category;
  requestCount: number;
  affectedPopulation: number;
  priority: PriorityLevel;
  lat: number;
  lng: number;
  radius: number; // in meters for map visualizer
  severityScore: number;
  trend: string;
  summary: string;
}

export interface Project {
  id: string;
  title: string;
  category: Category;
  region: string;
  status: 'proposed' | 'planning' | 'in_progress' | 'completed' | 'on_hold';
  budget: number;
  startDate: string;
  completionDate: string;
  requestsAddressed: number;
  affectedPopulation?: number;
  priority?: PriorityLevel;
  estimatedImpact?: 'High' | 'Medium' | 'Critical';
  progress?: number;
  description: string;
  beforeRequests?: number;
  afterRequests?: number;
  beforeScore?: number;
  afterScore?: number;
}

export interface AIRecommendation {
  id: string;
  region: string;
  detectedIssue: string;
  citizenRequests: number;
  affectedPopulation: number;
  infrastructureCondition: 'very_low' | 'low' | 'medium' | 'high';
  existingInvestment: number;
  priorityScore: number;
  priorityLevel?: PriorityLevel;
  recommendation: string;
  reasons: string[];
  category: Category;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: string;
  lastUpdated: string;
  recordCount: number;
  icon: string;
  status?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
}

export const CATEGORY_DEPARTMENT_MAP: Record<Category, string> = {
  'Roads': 'Public Works Department (PWD)',
  'Water': 'Water Resources & Public Health',
  'Drainage': 'Urban Development & Sanitation',
  'Streetlights': 'Energy & Power Infrastructure',
  'Electricity': 'Energy & Power Infrastructure',
  'Public Transport': 'Transport & Mobility Department',
  'Schools & Hospitals': 'Health & Education Infrastructure',
  'Sanitation': 'Urban Development & Sanitation',
  'Digital Infrastructure': 'Electronics & IT Infrastructure',
  'Other Development': 'Rural Development & Public Works',
};

export const DEPARTMENTS = [
  'Public Works Department (PWD)',
  'Water Resources & Public Health',
  'Urban Development & Sanitation',
  'Energy & Power Infrastructure',
  'Transport & Mobility Department',
  'Health & Education Infrastructure',
  'Rural Development & Public Works',
  'Electronics & IT Infrastructure',
];

export const DESIGNATIONS = [
  'Junior Engineer / Field Officer',
  'Assistant Executive Engineer (AEE)',
  'Executive Engineer / District Head',
  'Superintending Engineer / Regional Director',
  'District Magistrate & Collector (DM)',
  'Chief Engineer / State Secretariat Head',
];

export const DISTRICTS = [
  'Kalahandi',
  'Bhubaneswar',
  'Koraput',
  'Cuttack',
  'Malkangiri',
  'Rayagada',
  'Nuapada',
  'Sambalpur',
  'Puri',
  'Balasore',
  'Ganjam',
  'Mayurbhanj',
];
