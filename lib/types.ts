/**
 * OnboardX Enterprise Pure Type Definitions
 * 
 * Secure type contracts shared across client and server.
 * This file contains ONLY TypeScript interfaces and types.
 * It contains NO runtime data, NO seed arrays, NO credentials, and NO database instances.
 */

export interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
}

export interface DepartmentData {
  id: string;
  name: string;
  description: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: "LEGAL_DOCUMENT" | "IT_PROVISIONING" | "TRAINING" | "TEAM_ORIENTATION" | "BENEFITS" | "GENERAL";
  status: "PENDING" | "IN_PROGRESS" | "VERIFICATION_REQUIRED" | "COMPLETED" | "OVERDUE";
  assignedTo: "EMPLOYEE" | "HR" | "IT" | "MANAGER";
  dueDays: number;
  completedAt?: string;
  verifiedBy?: string;
}

export interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  managerName: string;
  startDate: string;
  status: "INVITED" | "IN_PROGRESS" | "REVIEW_PENDING" | "COMPLETED";
  progress: number; // 0 - 100
  avatarUrl: string;
  phone: string;
  tasks: TaskItem[];
  customFieldValues?: Record<string, string | number | boolean>;
  encryptedPii?: {
    ssnMasked?: string;
    taxIdEncrypted?: string;
    bankRoutingEncrypted?: string;
    isEncrypted?: boolean;
  };
}

export interface AssetData {
  id: string;
  name: string;
  serialNumber: string;
  category: "LAPTOP" | "MONITOR" | "SECURITY_KEY" | "MOBILE_DEVICE";
  model: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE";
  assignedToEmployeeId?: string;
  assignedToName?: string;
  specs?: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  provider: string;
  type: "HEALTH" | "DENTAL" | "VISION" | "RETIREMENT_401K" | "WELLNESS_STIPEND";
  description: string;
  costMonthly: number;
  isElected?: boolean;
}

export interface DocumentItem {
  id: string;
  employeeId: string;
  title: string;
  fileType: string;
  fileSize: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: string;
  isSigned?: boolean;
  signedAt?: string;
  cryptoSignatureHash?: string;
}

export interface TemplateData {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  department: string;
  tasksCount: number;
  tasks: Omit<TaskItem, "status" | "completedAt">[];
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  email: string;
  reports?: OrgNode[];
}

export interface TicketItem {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: "HARDWARE" | "SOFTWARE" | "VPN" | "ACCESS" | "GENERAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export interface SurveyResponseItem {
  id: string;
  employeeId: string;
  employeeName: string;
  surveyType: "30_DAY" | "60_DAY" | "90_DAY";
  score: number; // 1 to 10
  feedback: string;
  createdAt: string;
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string;
  active: boolean;
  createdAt: string;
  lastDeliveryStatus?: "SUCCESS" | "FAILED" | "PENDING";
  lastDeliveredAt?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullToken?: string;
  role: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface DocumentTemplateItem {
  id: string;
  title: string;
  category: string;
  version: string;
  content: string;
  updatedAt: string;
}

export interface TimeOffPolicyItem {
  id: string;
  name: string;
  daysPerYear: number;
  accrualFrequency: string;
  rolloverAllowed: boolean;
}

export interface CertificationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  name: string;
  issuingAuthority: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  daysUntilExpiry: number;
}

export interface BackgroundCheckItem {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  provider: "Checkr Enterprise";
  status: "CLEAR" | "PENDING" | "CONSIDER";
  tier: string;
  turnaroundDays: number;
  completedAt?: string;
  reportUrl?: string;
}

export interface EVerifyItem {
  id: string;
  employeeId: string;
  employeeName: string;
  caseNumber: string;
  documentType: "US_PASSPORT" | "PERMANENT_RESIDENT_CARD" | "DRIVERS_LICENSE_SSN";
  status: "EMPLOYMENT_AUTHORIZED" | "TNC_ACTION_REQUIRED" | "PENDING_REFERRAL";
  submissionDate: string;
  verifiedAt: string;
  eligibilityCode: string;
}

export interface WhistleblowerItem {
  id: string;
  trackingToken: string; // Secret SHA-256 token
  category: "COMPLIANCE" | "ETHICS" | "FINANCIAL" | "HARASSMENT" | "SAFETY";
  subject: string;
  details: string;
  status: "SUBMITTED" | "UNDER_INVESTIGATION" | "RESOLVED";
  createdAt: string;
  resolutionNotes?: string;
}

export interface OfficeDeskItem {
  id: string;
  deskCode?: string;
  floor: number | string;
  zone?: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  employeeId?: string | null;
  employeeName?: string | null;
  assignedToId?: string;
  assignedToName?: string;
  coordinatesX?: number;
  coordinatesY?: number;
}

export interface SwagOrderItem {
  id: string;
  employeeId: string;
  employeeName?: string;
  kitType?: string;
  shirtSize: string;
  items?: string[];
  shippingAddress: string;
  status: "ORDERED" | "DISPATCHED" | "DELIVERED" | "PENDING" | "SHIPPED";
  carrier?: string;
  trackingNumber: string;
  dispatchedAt?: string;
  estimatedDelivery?: string;
}

export interface JobRequisitionItem {
  id: string;
  requisitionCode?: string;
  title: string;
  department: string;
  hiringManager: string;
  targetStartDate: string;
  status: "SUBMITTED" | "FINANCE_APPROVED" | "OPEN" | "FILLED" | "DRAFT" | "PENDING_APPROVAL" | "APPROVED";
  salaryRange: string;
  headcount?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  jobDescription?: string;
  createdAt?: string;
}

export interface ScormCourseItem {
  id: string;
  title: string;
  version?: "SCORM 2004 4th Edition" | "SCORM 1.2";
  durationMinutes: number;
  passingScore: number;
  totalModules?: number;
  category?: string;
  description: string;
  standard?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "PASSED" | "COMPLETED";
  score?: number;
  progress?: number;
  timeSpentMinutes?: number;
}

export interface ScheduledReportItem {
  id: string;
  name?: string;
  title?: string;
  reportType: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  recipients: string[] | string;
  exportFormat?: "CSV" | "PDF";
  status: "ACTIVE" | "PAUSED";
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface CustomDomainItem {
  id: string;
  domain: string;
  cnameTarget: string;
  sslStatus: "ACTIVE" | "PROVISIONING" | "PENDING_VERIFICATION";
  dnsVerified?: boolean;
  isPrimary?: boolean;
}

export interface SsoConfigItem {
  providerName?: string;
  entityId?: string;
  idpEntityId?: string;
  ssoUrl?: string;
  certificateFingerprint?: string;
  scimSyncEnabled?: boolean;
  isEnabled?: boolean;
  enforceSso?: boolean;
  autoProvision?: boolean;
  activeDirectoryDomain?: string;
  azureTenantId?: string;
  azureClientId?: string;
}

export interface DiversityMetrics {
  genderRatio: { category: string; count: number; percentage: number }[];
  genderBreakdown: { female: number; male: number; nonBinary: number };
  ethnicityBreakdown: {
    asian: number;
    white: number;
    black: number;
    hispanic: number;
    multiracial: number;
  };
  departmentParity: { department: string; femalePct: number; malePct: number; nonBinaryPct: number }[];
  eeoCategoryCounts: { category: string; count: number }[];
  veteranPercentage: number;
  remotePercentage: number;
  leadershipFemalePercentage: number;
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "PKR" | "AED";

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: "text" | "date" | "dropdown" | "boolean";
  options?: string[];
  required: boolean;
  defaultValue?: string;
  category?: "PERSONAL" | "IT" | "COMPLIANCE" | "PREFERENCE";
}
