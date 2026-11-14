export type GrantCategory =
  | 'Federal'
  | 'State & Local'
  | 'Utility'
  | 'Fleet & Air Quality';

export type MatchLevel =
  | 'Strong Fit'
  | 'Conditional Fit'
  | 'Verify Eligibility'
  | 'Low Fit';

export type GapSeverity = 'Blocker' | 'Action Needed' | 'Recommended';

export interface GrantGapItem {
  id: string;
  title: string;
  detail: string;
  severity: GapSeverity;
}

export interface LiveWebsiteSnapshot {
  fetchedAt: string;
  httpStatus: number | null;
  pageTitle?: string;
  fetchMethod: string;
  websiteFindings: string;
  verifiedLinks: Array<{ title: string; uri: string }>;
}

export interface GrantAIAnalysis {
  analyzedAt: string;
  matchLevel: MatchLevel;
  estimatedPotential: string;
  whatYouNeedToDo: string;
  qualificationsMet: string[];
  gaps: GrantGapItem[];
  nextSteps: string[];
}

export interface GrantSource {
  id: string;
  name: string;
  organization: string;
  url: string;
  displayUrl: string;
  category: GrantCategory;
  grantVolume: string;
  requirementSummary: string;
  keyPrograms: string[];
  liveSnapshot?: LiveWebsiteSnapshot;
  aiAnalysis?: GrantAIAnalysis;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  city: string;
  county: string;
  entityType: string;
  industry: string;
  employees: number;
  annualRevenue: string;
  facilitySizeSqFt: number;
  facilityOwnership: 'Owned' | 'Leased';
  electricUtility: string;
  gasUtility: string;
  fleetVehicles: string;
  plannedProjects: string;
  hasSamUei: boolean;
  hasEnergyAudit: boolean;
  hasVendorQuotes: boolean;
  inNonattainmentArea: boolean;
  inRuralArea: boolean;
  notes: string;
}

export interface PersonaResponse {
  markdown: string;
  profile: BusinessProfile;
  filePath: string;
}
