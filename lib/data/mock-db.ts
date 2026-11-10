import { generateCryptoHash } from "../audit";

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

export const INITIAL_COMPANY: CompanyData = {
  id: "comp_acme_01",
  name: "Acme Technologies Inc.",
  slug: "acme",
  logoUrl: "/onboardx-logo.png",
  primaryColor: "#274C4A",
  accentColor: "#D98A1E",
};

export const INITIAL_DEPARTMENTS: DepartmentData[] = [
  { id: "dept_eng", name: "Engineering", description: "Core platform, backend systems, and infrastructure" },
  { id: "dept_prod", name: "Product & Design", description: "Product strategy, UI/UX systems, and user research" },
  { id: "dept_sales", name: "Revenue & Sales", description: "Enterprise sales, client solutions, and renewals" },
  { id: "dept_hr", name: "People Operations", description: "Talent acquisition, onboarding, and employee experience" },
  { id: "dept_it", name: "IT & Information Security", description: "Hardware provisioning, access control, and compliance" },
];

export const INITIAL_TEMPLATES: TemplateData[] = [
  {
    id: "tpl_eng_01",
    title: "Engineering Technical Onboarding",
    description: "Standard workflow for backend, frontend, and distributed systems engineers.",
    targetRole: "Staff Distributed Systems Engineer",
    department: "Engineering",
    tasksCount: 8,
    tasks: [
      { id: "t1", title: "Sign Proprietary Information & Invention Agreement", description: "Formalize confidentiality and intellectual property assignment.", category: "LEGAL_DOCUMENT", assignedTo: "EMPLOYEE", dueDays: 1 },
      { id: "t2", title: "Submit I-9 Verification & Government ID", description: "Upload passport or government ID document for federal compliance.", category: "LEGAL_DOCUMENT", assignedTo: "EMPLOYEE", dueDays: 1 },
      { id: "t3", title: "Provision MacBook Pro M3 Max & YubiKey Hardware", description: "Ship pre-configured macOS laptop with MDM and hardware security token.", category: "IT_PROVISIONING", assignedTo: "IT", dueDays: 1 },
      { id: "t4", title: "Grant GitHub Enterprise & AWS Staging Credentials", description: "Add new hire to engineering org, SSO groups, and AWS sandbox.", category: "IT_PROVISIONING", assignedTo: "IT", dueDays: 2 },
      { id: "t5", title: "Select Benefits & Healthcare Coverage Tier", description: "Review BlueCross health, Delta dental, and 401(k) election.", category: "BENEFITS", assignedTo: "EMPLOYEE", dueDays: 3 },
      { id: "t6", title: "Complete Security Awareness & PII Protection Quiz", description: "Review compliance policies, phishing defenses, and data encryption.", category: "TRAINING", assignedTo: "EMPLOYEE", dueDays: 5 },
      { id: "t7", title: "Schedule 30-Day Engineering Mentor 1-on-1", description: "Introductory alignment meeting with engineering lead.", category: "TEAM_ORIENTATION", assignedTo: "MANAGER", dueDays: 7 },
      { id: "t8", title: "First Pull Request: Developer Environment Setup", description: "Clone repository, run Docker containers, submit verification PR.", category: "GENERAL", assignedTo: "EMPLOYEE", dueDays: 10 },
    ],
  },
  {
    id: "tpl_sales_01",
    title: "Enterprise Revenue & Sales Onboarding",
    description: "Go-to-market playbook, CRM software access, and pitch deck training.",
    targetRole: "Enterprise Account Executive",
    department: "Revenue & Sales",
    tasksCount: 6,
    tasks: [
      { id: "ts1", title: "Sign Sales Compensation Plan & Non-Disclosure", description: "Commission structure and customer confidentiality.", category: "LEGAL_DOCUMENT", assignedTo: "EMPLOYEE", dueDays: 1 },
      { id: "ts2", title: "Configure Salesforce CRM & SalesLoft Accounts", description: "Provision enterprise seats and territory assignment.", category: "IT_PROVISIONING", assignedTo: "IT", dueDays: 2 },
      { id: "ts3", title: "Review Product Demo Deck & Value Proposition", description: "Master SME onboarding pain points and pricing tiers.", category: "TRAINING", assignedTo: "EMPLOYEE", dueDays: 3 },
      { id: "ts4", title: "Shadow 3 Live Enterprise Customer Calls", description: "Attend customer discovery calls with senior sales lead.", category: "TEAM_ORIENTATION", assignedTo: "MANAGER", dueDays: 7 },
      { id: "ts5", title: "Complete Pitch Certification with VP of Sales", description: "Deliver live 15-minute simulated pitch.", category: "TRAINING", assignedTo: "EMPLOYEE", dueDays: 14 },
      { id: "ts6", title: "Select Benefits Package", description: "Elect healthcare and retirement options.", category: "BENEFITS", assignedTo: "EMPLOYEE", dueDays: 3 },
    ],
  },
  {
    id: "tpl_prod_01",
    title: "Product Design & Research Onboarding",
    description: "Design system architecture, user research vaults, and product telemetry.",
    targetRole: "Senior Product Designer",
    department: "Product & Design",
    tasksCount: 6,
    tasks: [
      { id: "tp1", title: "Sign Employment Agreement & NDA", description: "Standard SME employment contracts.", category: "LEGAL_DOCUMENT", assignedTo: "EMPLOYEE", dueDays: 1 },
      { id: "tp2", title: "Provision Figma Enterprise & Miro Licenses", description: "Design file permissions and design system access.", category: "IT_PROVISIONING", assignedTo: "IT", dueDays: 1 },
      { id: "tp3", title: "Review OnboardX Design Language & Tokens v1.0", description: "Deep dive into Slate Pine palette, 12px borders, and architectural style.", category: "TRAINING", assignedTo: "EMPLOYEE", dueDays: 2 },
      { id: "tp4", title: "Connect with Engineering Architecture Counterpart", description: "Understand component library architecture and shadcn patterns.", category: "TEAM_ORIENTATION", assignedTo: "MANAGER", dueDays: 4 },
      { id: "tp5", title: "Elect Health & Vision Plans", description: "Complete benefits enrollment.", category: "BENEFITS", assignedTo: "EMPLOYEE", dueDays: 3 },
      { id: "tp6", title: "Conduct First Usability Audit on New Hire Portal", description: "Formulate 3 UX improvement hypotheses.", category: "GENERAL", assignedTo: "EMPLOYEE", dueDays: 14 },
    ],
  },
];

export const INITIAL_EMPLOYEES: EmployeeData[] = [
  {
    id: "emp_kaelen_01",
    firstName: "Kaelen",
    lastName: "Chen",
    email: "kaelen.chen@acme-enterprises.com",
    jobTitle: "Staff Distributed Systems Engineer",
    department: "Engineering",
    managerName: "Sofia Calderon",
    startDate: "2026-09-21",
    status: "IN_PROGRESS",
    progress: 68,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (415) 890-2341",
    tasks: [
      { id: "tk1", title: "Sign Proprietary Information Agreement", description: "Formalize confidentiality and intellectual property assignment.", category: "LEGAL_DOCUMENT", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 1, completedAt: "2026-09-21T10:14:00Z" },
      { id: "tk2", title: "Upload Government ID & Tax Documentation", description: "Submit passport or state ID for federal compliance.", category: "LEGAL_DOCUMENT", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 1, completedAt: "2026-09-21T11:30:00Z" },
      { id: "tk3", title: "Provision MacBook Pro M3 Max & YubiKey Hardware", description: "Courier pre-configured workstation with MDM.", category: "IT_PROVISIONING", status: "COMPLETED", assignedTo: "IT", dueDays: 1, completedAt: "2026-09-22T09:00:00Z", verifiedBy: "Devon Reed (IT)" },
      { id: "tk4", title: "Grant GitHub Enterprise & AWS Cloud Access", description: "Assign to engineering security groups and staging environments.", category: "IT_PROVISIONING", status: "IN_PROGRESS", assignedTo: "IT", dueDays: 2 },
      { id: "tk5", title: "Select Benefits & Retirement Plan", description: "Review BlueCross health, Delta dental, and 401(k) election.", category: "BENEFITS", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 3, completedAt: "2026-09-22T15:20:00Z" },
      { id: "tk6", title: "Complete Security Awareness & PII Protection Quiz", description: "Review compliance guidelines, phishing defenses, and data encryption.", category: "TRAINING", status: "PENDING", assignedTo: "EMPLOYEE", dueDays: 5 },
      { id: "tk7", title: "Schedule 30-Day Engineering Mentor 1-on-1", description: "Connect with Sofia Calderon for role orientation.", category: "TEAM_ORIENTATION", status: "PENDING", assignedTo: "MANAGER", dueDays: 7 },
      { id: "tk8", title: "Submit 30-Day New Hire Sentiment Survey", description: "Share honest feedback regarding your first month experience.", category: "TRAINING", status: "PENDING", assignedTo: "EMPLOYEE", dueDays: 30 },
    ],
    customFieldValues: {
      tshirt_size: "L",
      emergency_contact: "Sarah Chen (+1 415-555-0199)",
      clearance_level: "Secret",
      dietary_preference: "Halal",
      workstation_setup: "Standing Desk Motorized",
    },
    encryptedPii: {
      ssnMasked: "•••-••-4819",
      taxIdEncrypted: "enc_gcm_a8190f891024bd",
      bankRoutingEncrypted: "enc_gcm_321094892019",
      isEncrypted: true,
    },
  },
  {
    id: "emp_maya_02",
    firstName: "Maya",
    lastName: "Lin",
    email: "maya.lin@acme-enterprises.com",
    jobTitle: "Senior Product Designer",
    department: "Product & Design",
    managerName: "Sofia Calderon",
    startDate: "2026-09-23",
    status: "IN_PROGRESS",
    progress: 45,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (415) 762-9011",
    tasks: [
      { id: "tm1", title: "Sign Employment Agreement & IP Assignment", description: "Legal contract submission.", category: "LEGAL_DOCUMENT", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 1, completedAt: "2026-09-23T14:10:00Z" },
      { id: "tm2", title: "Provision Figma Enterprise & Studio Display", description: "Hardware and software design tooling.", category: "IT_PROVISIONING", status: "IN_PROGRESS", assignedTo: "IT", dueDays: 2 },
      { id: "tm3", title: "Select Benefits Package", description: "Choose medical and vision insurance tier.", category: "BENEFITS", status: "PENDING", assignedTo: "EMPLOYEE", dueDays: 3 },
      { id: "tm4", title: "Review OnboardX Design Language v1.0", description: "Deep dive into Slate Pine palette and 12px rules.", category: "TRAINING", status: "PENDING", assignedTo: "EMPLOYEE", dueDays: 4 },
    ],
    customFieldValues: {
      tshirt_size: "M",
      emergency_contact: "David Lin (+1 415-555-0812)",
      clearance_level: "None",
      dietary_preference: "Vegetarian",
      workstation_setup: "Dual Monitor Articulating Arm",
    },
    encryptedPii: {
      ssnMasked: "•••-••-9122",
      taxIdEncrypted: "enc_gcm_bb91024cd91a",
      bankRoutingEncrypted: "enc_gcm_84920194821",
      isEncrypted: true,
    },
  },
  {
    id: "emp_tariq_03",
    firstName: "Tariq",
    lastName: "Al-Mansoor",
    email: "tariq.almansoor@acme-enterprises.com",
    jobTitle: "Enterprise Account Executive",
    department: "Revenue & Sales",
    managerName: "Rachel Scott",
    startDate: "2026-09-15",
    status: "REVIEW_PENDING",
    progress: 90,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (212) 555-8910",
    tasks: [
      { id: "tt1", title: "Sign Sales Compensation Plan", description: "Commission agreements.", category: "LEGAL_DOCUMENT", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 1, completedAt: "2026-09-15T09:00:00Z" },
      { id: "tt2", title: "Provision Salesforce CRM Seat", description: "Access credentials.", category: "IT_PROVISIONING", status: "COMPLETED", assignedTo: "IT", dueDays: 2, completedAt: "2026-09-16T11:00:00Z" },
      { id: "tt3", title: "Deliver Live Pitch Certification", description: "15-minute simulated presentation.", category: "TRAINING", status: "VERIFICATION_REQUIRED", assignedTo: "HR", dueDays: 7 },
    ],
  },
  {
    id: "emp_chloe_04",
    firstName: "Chloe",
    lastName: "Bennett",
    email: "chloe.bennett@acme-enterprises.com",
    jobTitle: "People Operations Specialist",
    department: "People Operations",
    managerName: "Marcus Thorne",
    startDate: "2026-08-10",
    status: "COMPLETED",
    progress: 100,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (646) 332-1980",
    tasks: [
      { id: "tc1", title: "All Onboarding Workflows Finalized", description: "All compliance, benefits, and tool access verified.", category: "GENERAL", status: "COMPLETED", assignedTo: "EMPLOYEE", dueDays: 1, completedAt: "2026-08-25T16:00:00Z" },
    ],
  },
  {
    id: "emp_julian_05",
    firstName: "Julian",
    lastName: "Vance",
    email: "julian.vance@acme-enterprises.com",
    jobTitle: "Frontend Software Engineer",
    department: "Engineering",
    managerName: "Sofia Calderon",
    startDate: "2026-09-28",
    status: "INVITED",
    progress: 12,
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (415) 309-8812",
    tasks: [
      { id: "tj1", title: "Sign Proprietary Information Agreement", description: "Digital contract signature.", category: "LEGAL_DOCUMENT", status: "PENDING", assignedTo: "EMPLOYEE", dueDays: 1 },
      { id: "tj2", title: "Ship MacBook Pro M3", description: "Courier dispatch.", category: "IT_PROVISIONING", status: "PENDING", assignedTo: "IT", dueDays: 1 },
    ],
  },
];

export const INITIAL_ASSETS: AssetData[] = [
  { id: "ast_01", name: 'MacBook Pro 16" M3 Max', serialNumber: "APPL-MBP-98431", category: "LAPTOP", model: "Apple Silicon M3 Max / 64GB / 1TB", status: "ASSIGNED", assignedToEmployeeId: "emp_kaelen_01", assignedToName: "Kaelen Chen" },
  { id: "ast_02", name: 'Dell UltraSharp 32" 4K Monitor', serialNumber: "DELL-U32-4412", category: "MONITOR", model: "U3223QE 4K IPS Black", status: "ASSIGNED", assignedToEmployeeId: "emp_kaelen_01", assignedToName: "Kaelen Chen" },
  { id: "ast_03", name: "YubiKey 5C NFC Security Key", serialNumber: "YUBI-5C-0021", category: "SECURITY_KEY", model: "FIPS Series 5C NFC", status: "ASSIGNED", assignedToEmployeeId: "emp_kaelen_01", assignedToName: "Kaelen Chen" },
  { id: "ast_04", name: 'ThinkPad X1 Carbon Gen 11', serialNumber: "LEN-X1C-3091", category: "LAPTOP", model: "Intel Core i7-1365U / 32GB / 512GB", status: "AVAILABLE" },
  { id: "ast_05", name: 'Apple Studio Display 27"', serialNumber: "APPL-DISP-7721", category: "MONITOR", model: "5K Retina Display with Tilt-Adjustable Stand", status: "AVAILABLE" },
  { id: "ast_06", name: 'MacBook Air 15" M3', serialNumber: "APPL-MBA-5510", category: "LAPTOP", model: "Apple M3 / 16GB / 512GB", status: "AVAILABLE" },
];

export const INITIAL_BENEFITS: BenefitPlan[] = [
  { id: "ben_01", name: "BlueCross Premier PPO Health Plan", provider: "BlueCross BlueShield", type: "HEALTH", description: "Comprehensive nationwide medical, low $500 deductible, $0 monthly employee cost.", costMonthly: 0, isElected: true },
  { id: "ben_02", name: "Delta Dental High Coverage Network", provider: "Delta Dental", type: "DENTAL", description: "100% preventive coverage, 80% basic procedures, $2,000 annual maximum.", costMonthly: 15, isElected: true },
  { id: "ben_03", name: "VSP Vision Care Plus", provider: "VSP Vision", type: "VISION", description: "Annual comprehensive exam, $250 frame allowance, fully covered lenses.", costMonthly: 8, isElected: false },
  { id: "ben_04", name: "Vanguard 401(k) Retirement Plan", provider: "Vanguard", type: "RETIREMENT_401K", description: "Automatic 5% company matching dollar-for-dollar with immediate vesting.", costMonthly: 0, isElected: true },
  { id: "ben_05", name: "Ergonomic & Wellness Annual Stipend", provider: "Acme People Ops", type: "WELLNESS_STIPEND", description: "$1,500/year reimbursement for home office equipment, gym, or wellness apps.", costMonthly: 0, isElected: true },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc_01",
    employeeId: "emp_kaelen_01",
    title: "Proprietary Information & Inventions Agreement (PIIA)",
    fileType: "application/pdf",
    fileSize: "1.4 MB",
    status: "APPROVED",
    verifiedAt: "2026-09-21T10:15:00Z",
    isSigned: true,
    signedAt: "2026-09-21T10:14:00Z",
    cryptoSignatureHash: "8f7b2c9e10d34a5b6c7e8f90123456789abcdef0123456789abcdef012345678",
  },
  {
    id: "doc_02",
    employeeId: "emp_kaelen_01",
    title: "US Passport Scan (Form I-9 Compliance)",
    fileType: "image/jpeg",
    fileSize: "3.2 MB",
    status: "APPROVED",
    verifiedAt: "2026-09-21T11:35:00Z",
  },
  {
    id: "doc_03",
    employeeId: "emp_kaelen_01",
    title: "Direct Deposit & Banking Authorization",
    fileType: "application/pdf",
    fileSize: "450 KB",
    status: "APPROVED",
    verifiedAt: "2026-09-21T11:40:00Z",
    isSigned: true,
    signedAt: "2026-09-21T11:39:00Z",
    cryptoSignatureHash: "a1c2e3f4b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234567890abcdef12345678",
  },
];

export const INITIAL_ORG_CHART: OrgNode = {
  id: "usr_admin_01",
  name: "Eleanor Vance",
  role: "Chief Operating Officer",
  department: "Executive",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  email: "eleanor.vance@acme-enterprises.com",
  reports: [
    {
      id: "usr_mgr_01",
      name: "Sofia Calderon",
      role: "VP of Product Engineering",
      department: "Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      email: "sofia.calderon@acme-enterprises.com",
      reports: [
        {
          id: "emp_kaelen_01",
          name: "Kaelen Chen",
          role: "Staff Distributed Systems Engineer",
          department: "Engineering",
          avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
          email: "kaelen.chen@acme-enterprises.com",
        },
        {
          id: "emp_julian_05",
          name: "Julian Vance",
          role: "Frontend Software Engineer",
          department: "Engineering",
          avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
          email: "julian.vance@acme-enterprises.com",
        },
        {
          id: "emp_maya_02",
          name: "Maya Lin",
          role: "Senior Product Designer",
          department: "Product & Design",
          avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          email: "maya.lin@acme-enterprises.com",
        },
      ],
    },
    {
      id: "usr_hr_01",
      name: "Marcus Thorne",
      role: "Director of People & Culture",
      department: "People Operations",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      email: "marcus.thorne@acme-enterprises.com",
      reports: [
        {
          id: "emp_chloe_04",
          name: "Chloe Bennett",
          role: "People Operations Specialist",
          department: "People Operations",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          email: "chloe.bennett@acme-enterprises.com",
        },
      ],
    },
    {
      id: "usr_it_01",
      name: "Devon Reed",
      role: "Senior IT Systems Engineer",
      department: "IT & InfoSec",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      email: "devon.reed@acme-enterprises.com",
    },
    {
      id: "usr_sales_lead",
      name: "Rachel Scott",
      role: "VP of Sales & Growth",
      department: "Revenue & Sales",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      email: "rachel.scott@acme-enterprises.com",
      reports: [
        {
          id: "emp_tariq_03",
          name: "Tariq Al-Mansoor",
          role: "Enterprise Account Executive",
          department: "Revenue & Sales",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          email: "tariq.almansoor@acme-enterprises.com",
        },
      ],
    },
  ],
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: "aud_01",
    actorEmail: "kaelen.chen@acme-enterprises.com",
    actorRole: "EMPLOYEE",
    action: "DOCUMENT_SIGNED",
    entityType: "Document",
    entityId: "doc_01",
    details: '{"documentTitle":"Proprietary Information & Inventions Agreement","method":"CANVAS_DIGITAL_SIG"}',
    ipAddress: "192.168.1.104",
    sha256Hash: "8f7b2c9e10d34a5b6c7e8f90123456789abcdef0123456789abcdef012345678",
    createdAt: "2026-09-21T10:14:00Z",
  },
  {
    id: "aud_02",
    actorEmail: "devon.reed@acme-enterprises.com",
    actorRole: "IT_PROVISIONER",
    action: "ASSET_ASSIGNED",
    entityType: "Asset",
    entityId: "ast_01",
    details: '{"serialNumber":"APPL-MBP-98431","recipient":"Kaelen Chen","model":"MacBook Pro 16 M3 Max"}',
    ipAddress: "10.0.4.12",
    sha256Hash: "b2d3f4a5c6e7890123456789abcdef0123456789abcdef0123456789abcdef01",
    createdAt: "2026-09-22T09:00:00Z",
  },
  {
    id: "aud_03",
    actorEmail: "marcus.thorne@acme-enterprises.com",
    actorRole: "HR_MANAGER",
    action: "EMPLOYEE_ONBOARDED",
    entityType: "Employee",
    entityId: "emp_kaelen_01",
    details: '{"assignedTemplate":"Engineering Technical Onboarding","startDate":"2026-09-21"}',
    ipAddress: "10.0.2.45",
    sha256Hash: "c3e4f5a6b7d890123456789abcdef0123456789abcdef0123456789abcdef02",
    createdAt: "2026-09-21T08:30:00Z",
  },
  {
    id: "aud_04",
    actorEmail: "eleanor.vance@acme-enterprises.com",
    actorRole: "ADMIN",
    action: "SETTINGS_UPDATED",
    entityType: "Company",
    entityId: "comp_acme_01",
    details: '{"updatedField":"primaryColor","value":"#274C4A","brand":"Slate Pine"}',
    ipAddress: "10.0.1.5",
    sha256Hash: "d4f5a6b7c8e90123456789abcdef0123456789abcdef0123456789abcdef03",
    createdAt: "2026-09-20T14:00:00Z",
  },
];

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

export const INITIAL_TICKETS: TicketItem[] = [
  {
    id: "tkt_01",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    title: "Need AWS Staging IAM Access Token",
    description: "Please assign developer role in AWS IAM staging account for Kubernetes cluster inspection.",
    category: "ACCESS",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: "2026-09-22T14:30:00Z",
  },
  {
    id: "tkt_02",
    employeeId: "emp_maya_02",
    employeeName: "Maya Lin",
    title: "Dell 4K Display USB-C Hub Power Delivery",
    description: "Monitor charges laptop intermittently when using secondary Thunderbolt port.",
    category: "HARDWARE",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdAt: "2026-09-18T10:15:00Z",
  },
];

export const INITIAL_SURVEYS: SurveyResponseItem[] = [
  {
    id: "srv_01",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    surveyType: "30_DAY",
    score: 10,
    feedback: "The interactive onboarding checklist and digital signature pad made day one completely painless. Laptop was delivered before start date!",
    createdAt: "2026-09-25T11:00:00Z",
  },
  {
    id: "srv_02",
    employeeId: "emp_maya_02",
    employeeName: "Maya Lin",
    surveyType: "30_DAY",
    score: 9,
    feedback: "Great welcome experience and clear orientation milestones. Would appreciate more design system documentation links.",
    createdAt: "2026-09-20T16:45:00Z",
  },
];

export const INITIAL_WEBHOOKS: WebhookItem[] = [
  {
    id: "wh_01",
    url: "https://api.acme-enterprises.com/webhooks/ats",
    events: "employee.created, employee.completed",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
    lastDeliveryStatus: "SUCCESS",
    lastDeliveredAt: "2026-09-26T07:15:00Z",
  },
  {
    id: "wh_02",
    url: "https://hooks.slack.com/services/T00/B00/X00",
    events: "task.bottleneck, it.ticket_created",
    active: true,
    createdAt: "2026-09-05T09:30:00Z",
    lastDeliveryStatus: "SUCCESS",
    lastDeliveredAt: "2026-09-25T14:20:00Z",
  },
];

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: "key_01",
    name: "Greenhouse ATS Production Ingestion",
    keyPrefix: "obx_live_948f20...",
    role: "HR_INTEGRATION",
    createdAt: "2026-09-10T12:00:00Z",
    lastUsedAt: "2026-09-26T06:45:00Z",
  },
  {
    id: "key_02",
    name: "IT Asset Provisioner CLI Bot",
    keyPrefix: "obx_live_732a19...",
    role: "IT_PROVISIONER",
    createdAt: "2026-09-12T15:20:00Z",
    lastUsedAt: "2026-09-25T18:10:00Z",
  },
];

export const INITIAL_DOCUMENT_TEMPLATES: DocumentTemplateItem[] = [
  {
    id: "dt_01",
    title: "Proprietary Information & Inventions Agreement (PIIA)",
    category: "Legal & IP",
    version: "v3.2",
    content: "This Proprietary Information and Inventions Agreement is entered into between Acme Technologies Inc. and the Employee...",
    updatedAt: "2026-08-15",
  },
  {
    id: "dt_02",
    title: "Mutual Confidentiality & Non-Disclosure Agreement (NDA)",
    category: "Legal & Compliance",
    version: "v2.0",
    content: "Confidentiality terms covering intellectual property, client data, and proprietary trade secrets...",
    updatedAt: "2026-06-20",
  },
  {
    id: "dt_03",
    title: "SME Remote Work & Hardware Custody Policy",
    category: "IT & HR",
    version: "v1.4",
    content: "Guidelines for secure home office setups, disk encryption, VPN usage, and hardware return conditions...",
    updatedAt: "2026-09-01",
  },
  {
    id: "dt_04",
    title: "Equal Opportunity & Anti-Harassment Standards",
    category: "People Operations",
    version: "v4.0",
    content: "Acme Technologies is dedicated to providing an inclusive, safe, and professional workplace for all employees...",
    updatedAt: "2026-07-10",
  },
];

export const INITIAL_TIME_OFF_POLICIES: TimeOffPolicyItem[] = [
  { id: "pto_01", name: "Standard Paid Time Off (PTO)", daysPerYear: 20, accrualFrequency: "Monthly", rolloverAllowed: true },
  { id: "pto_02", name: "Sick & Mental Wellness Leave", daysPerYear: 10, accrualFrequency: "Annual Lump Sum", rolloverAllowed: false },
  { id: "pto_03", name: "Parental Leave Policy", daysPerYear: 60, accrualFrequency: "Per Qualifying Event", rolloverAllowed: false },
];

// --- 26. Certifications & Expirations ---
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

export const INITIAL_CERTIFICATIONS: CertificationItem[] = [
  {
    id: "cert_01",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    name: "AWS Certified Solutions Architect — Professional",
    issuingAuthority: "Amazon Web Services",
    licenseNumber: "AWS-PSA-99410",
    issueDate: "2024-10-15",
    expiryDate: "2026-10-25", // ~29 days left -> EXPIRING_SOON
    status: "EXPIRING_SOON",
    daysUntilExpiry: 29,
  },
  {
    id: "cert_02",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    name: "Certified Kubernetes Security Specialist (CKS)",
    issuingAuthority: "Linux Foundation",
    licenseNumber: "LF-CKS-88129",
    issueDate: "2025-04-10",
    expiryDate: "2027-04-10",
    status: "ACTIVE",
    daysUntilExpiry: 561,
  },
  {
    id: "cert_03",
    employeeId: "emp_maya_02",
    employeeName: "Maya Lin",
    name: "Nielsen Norman Group UX Master Certification",
    issuingAuthority: "NN/g Group",
    licenseNumber: "NNG-UXM-11204",
    issueDate: "2024-08-01",
    expiryDate: "2026-10-10", // ~14 days left -> EXPIRING_SOON
    status: "EXPIRING_SOON",
    daysUntilExpiry: 14,
  },
  {
    id: "cert_04",
    employeeId: "emp_chloe_04",
    employeeName: "Chloe Bennett",
    name: "SHRM Senior Certified Professional (SHRM-SCP)",
    issuingAuthority: "Society for Human Resource Management",
    licenseNumber: "SHRM-SCP-44912",
    issueDate: "2023-05-10",
    expiryDate: "2026-05-10", // Expired
    status: "EXPIRED",
    daysUntilExpiry: -139,
  },
];

// --- 27. Background Checks & Checkr ---
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
  reportUrl: string;
}

export const INITIAL_BACKGROUND_CHECKS: BackgroundCheckItem[] = [
  {
    id: "chk_01",
    candidateId: "emp_kaelen_01",
    candidateName: "Kaelen Chen",
    jobTitle: "Staff Distributed Systems Engineer",
    provider: "Checkr Enterprise",
    status: "CLEAR",
    tier: "Standard Criminal + SSN Trace + Global Watchlist",
    turnaroundDays: 2,
    completedAt: "2026-09-18T14:20:00Z",
    reportUrl: "https://dashboard.checkr.com/reports/chk_kaelen_01",
  },
  {
    id: "chk_02",
    candidateId: "emp_maya_02",
    candidateName: "Maya Lin",
    jobTitle: "Senior Product Designer",
    provider: "Checkr Enterprise",
    status: "CLEAR",
    tier: "Standard Criminal + Education Verification",
    turnaroundDays: 3,
    completedAt: "2026-09-20T10:15:00Z",
    reportUrl: "https://dashboard.checkr.com/reports/chk_maya_02",
  },
  {
    id: "chk_03",
    candidateId: "emp_julian_05",
    candidateName: "Julian Vance",
    jobTitle: "Frontend Software Engineer",
    provider: "Checkr Enterprise",
    status: "PENDING",
    tier: "Comprehensive Criminal + Motor Vehicle Records",
    turnaroundDays: 1,
    reportUrl: "https://dashboard.checkr.com/reports/chk_julian_05",
  },
];

// --- 28. DHS E-Verify US Compliance ---
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

export const INITIAL_E_VERIFY_CASES: EVerifyItem[] = [
  {
    id: "ev_01",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    caseNumber: "2026-EV-94820194",
    documentType: "US_PASSPORT",
    status: "EMPLOYMENT_AUTHORIZED",
    submissionDate: "2026-09-21T11:45:00Z",
    verifiedAt: "2026-09-21T11:46:12Z",
    eligibilityCode: "DHS-AUTH-A109",
  },
  {
    id: "ev_02",
    employeeId: "emp_maya_02",
    employeeName: "Maya Lin",
    caseNumber: "2026-EV-88410293",
    documentType: "DRIVERS_LICENSE_SSN",
    status: "EMPLOYMENT_AUTHORIZED",
    submissionDate: "2026-09-23T14:30:00Z",
    verifiedAt: "2026-09-23T14:31:05Z",
    eligibilityCode: "DHS-AUTH-A109",
  },
];

// --- 29. Whistleblower Reports ---
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

export const INITIAL_WHISTLEBLOWER_REPORTS: WhistleblowerItem[] = [
  {
    id: "wb_01",
    trackingToken: "wbt_a94f8e21bc034d98",
    category: "COMPLIANCE",
    subject: "Third-party vendor data transfer protocol verification",
    details: "Observed external data contractor testing without signed DPA documentation. Please audit data privacy compliance safeguards.",
    status: "UNDER_INVESTIGATION",
    createdAt: "2026-09-18T09:00:00Z",
    resolutionNotes: "Legal Ops initiated vendor security compliance audit on Sep 20.",
  },
];

// --- 30. Office Map & Desks ---
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

export const INITIAL_OFFICE_DESKS: OfficeDeskItem[] = [
  { id: "d_01", deskCode: "SF-F2-A01", floor: "Floor 3 - Engineering Hub", zone: "Engineering Pod Alpha", status: "OCCUPIED", employeeId: "emp_kaelen_01", employeeName: "Kaelen Chen", assignedToId: "emp_kaelen_01", assignedToName: "Kaelen Chen", coordinatesX: 120, coordinatesY: 140 },
  { id: "d_02", deskCode: "SF-F2-A02", floor: "Floor 3 - Engineering Hub", zone: "Engineering Pod Alpha", status: "OCCUPIED", employeeId: "emp_julian_05", employeeName: "Julian Vance", assignedToId: "emp_julian_05", assignedToName: "Julian Vance", coordinatesX: 180, coordinatesY: 140 },
  { id: "d_03", deskCode: "SF-F2-A03", floor: "Floor 3 - Engineering Hub", zone: "Engineering Pod Alpha", status: "AVAILABLE", coordinatesX: 240, coordinatesY: 140 },
  { id: "d_04", deskCode: "SF-F2-B01", floor: "Floor 4 - Product & Design", zone: "Product & UX Studio", status: "OCCUPIED", employeeId: "emp_maya_02", employeeName: "Maya Lin", assignedToId: "emp_maya_02", assignedToName: "Maya Lin", coordinatesX: 120, coordinatesY: 260 },
  { id: "d_05", deskCode: "SF-F2-B02", floor: "Floor 4 - Product & Design", zone: "Product & UX Studio", status: "AVAILABLE", coordinatesX: 180, coordinatesY: 260 },
  { id: "d_06", deskCode: "SF-F2-C01", floor: "Floor 3 - Engineering Hub", zone: "People Ops & HR Suite", status: "OCCUPIED", employeeId: "emp_chloe_04", employeeName: "Chloe Bennett", assignedToId: "emp_chloe_04", assignedToName: "Chloe Bennett", coordinatesX: 360, coordinatesY: 140 },
  { id: "d_07", deskCode: "SF-F2-C02", floor: "Floor 3 - Engineering Hub", zone: "People Ops & HR Suite", status: "AVAILABLE", coordinatesX: 420, coordinatesY: 140 },
];

// --- 31. Swag Store Orders ---
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

export const INITIAL_SWAG_ORDERS: SwagOrderItem[] = [
  {
    id: "swag_01",
    employeeId: "emp_kaelen_01",
    employeeName: "Kaelen Chen",
    kitType: "Engineering Premier Swag Kit",
    shirtSize: "L",
    items: ["Company Welcome Hoodie", "Stainless Insulated Tumbler", "Die-Cut Laptop Stickers", "Canvas Laptop Sleeve"],
    shippingAddress: "450 Mission St, San Francisco, CA 94105",
    status: "DELIVERED",
    carrier: "FedEx Priority Overnight",
    trackingNumber: "FDX-994821034-US",
    dispatchedAt: "2026-09-18T10:00:00Z",
    estimatedDelivery: "Sep 20, 2026",
  },
  {
    id: "swag_02",
    employeeId: "emp_maya_02",
    employeeName: "Maya Lin",
    kitType: "Creative Studio Pack",
    shirtSize: "M",
    items: ["Company Welcome Hoodie", "Stainless Insulated Tumbler", "Field Notes Journal"],
    shippingAddress: "1280 Valencia St, San Francisco, CA 94110",
    status: "DISPATCHED",
    carrier: "UPS Ground",
    trackingNumber: "1Z999AA10123456784",
    dispatchedAt: "2026-09-22T14:30:00Z",
    estimatedDelivery: "Sep 25, 2026",
  },
];

// --- 32. Job Requisitions ---
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

export const INITIAL_JOB_REQUISITIONS: JobRequisitionItem[] = [
  {
    id: "req_01",
    requisitionCode: "REQ-ENG-2026-08",
    title: "Senior Infrastructure & Cloud Architect",
    department: "Engineering",
    hiringManager: "Sofia Calderon",
    targetStartDate: "2026-11-01",
    status: "OPEN",
    salaryRange: "$185,000 - $225,000",
    headcount: 2,
    priority: "HIGH",
    jobDescription: "Lead Kubernetes cluster orchestration, multi-region failover, and zero-trust networking architecture.",
    createdAt: "2026-09-15T10:00:00Z",
  },
  {
    id: "req_02",
    requisitionCode: "REQ-SALES-2026-02",
    title: "Senior Enterprise Customer Success Lead",
    department: "Revenue & Sales",
    hiringManager: "Rachel Scott",
    targetStartDate: "2026-10-15",
    status: "FINANCE_APPROVED",
    salaryRange: "$130,000 - $160,000",
    headcount: 1,
    priority: "MEDIUM",
    jobDescription: "Manage SME renewals, client onboarding journeys, and quarterly business reviews.",
    createdAt: "2026-09-20T11:30:00Z",
  },
  {
    id: "req_03",
    requisitionCode: "REQ-PROD-2026-03",
    title: "Principal Product Designer",
    department: "Product",
    hiringManager: "Elena Rostova",
    targetStartDate: "2026-10-30",
    status: "SUBMITTED",
    salaryRange: "$160,000 - $195,000",
    headcount: 1,
    priority: "HIGH",
    jobDescription: "Architect design tokens, component systems, and UX flows for enterprise multi-tenancy.",
    createdAt: "2026-09-24T14:00:00Z",
  },
];

// --- 33. SCORM Courses ---
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

export const INITIAL_SCORM_COURSES: ScormCourseItem[] = [
  {
    id: "scorm_01",
    title: "SOC 2 Type II & PII Data Protection Fundamentals",
    version: "SCORM 2004 4th Edition",
    standard: "SCORM 2004",
    durationMinutes: 20,
    passingScore: 80,
    totalModules: 4,
    category: "Information Security & Compliance",
    description: "Interactive employee training covering phishing prevention, password management, clean desk policy, and cryptographic audit requirements.",
    status: "NOT_STARTED",
    progress: 0,
    timeSpentMinutes: 0,
  },
  {
    id: "scorm_02",
    title: "Acme Enterprise Culture & Values Handbook",
    version: "SCORM 2004 4th Edition",
    standard: "SCORM 1.2",
    durationMinutes: 15,
    passingScore: 80,
    totalModules: 3,
    category: "Company Culture",
    description: "Overview of company operating principles, asynchronous communication standards, and SME client empathy.",
    status: "PASSED",
    progress: 100,
    score: 100,
    timeSpentMinutes: 15,
  },
];

// --- 34. Scheduled Reports ---
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

export const INITIAL_SCHEDULED_REPORTS: ScheduledReportItem[] = [
  {
    id: "sch_01",
    name: "Weekly Executive Onboarding Digest",
    title: "Weekly Executive Onboarding Digest",
    reportType: "ONBOARDING_VELOCITY",
    frequency: "WEEKLY",
    recipients: ["eleanor.vance@acme-enterprises.com", "marcus.thorne@acme-enterprises.com"],
    exportFormat: "CSV",
    status: "ACTIVE",
    lastRunAt: "2026-09-22T08:00:00Z",
    nextRunAt: "2026-09-29T08:00:00Z",
  },
  {
    id: "sch_02",
    name: "Monthly Compliance & Certification Audit",
    title: "Monthly Compliance & Certification Audit",
    reportType: "COMPLIANCE_DIGEST",
    frequency: "MONTHLY",
    recipients: ["compliance@acme-enterprises.com"],
    exportFormat: "PDF",
    status: "ACTIVE",
    lastRunAt: "2026-09-01T09:00:00Z",
    nextRunAt: "2026-10-01T09:00:00Z",
  },
];

// --- 35. Custom Domains & SSL ---
export interface CustomDomainItem {
  id: string;
  domain: string;
  cnameTarget: string;
  sslStatus: "ACTIVE" | "PROVISIONING" | "PENDING_VERIFICATION";
  dnsVerified?: boolean;
  isPrimary?: boolean;
}

export const INITIAL_CUSTOM_DOMAINS: CustomDomainItem[] = [
  {
    id: "dom_01",
    domain: "onboarding.acme-enterprises.com",
    cnameTarget: "cname.onboardx.io",
    sslStatus: "ACTIVE",
    dnsVerified: true,
    isPrimary: true,
  },
];

// --- 36. SSO / SAML Configuration ---
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

export const INITIAL_SSO_CONFIG: SsoConfigItem = {
  providerName: "Microsoft Entra ID (Azure AD)",
  entityId: "https://login.microsoftonline.com/acme-corp-directory/saml2",
  idpEntityId: "https://login.microsoftonline.com/acme-corp-directory/saml2",
  ssoUrl: "https://login.microsoftonline.com/acme-corp-directory/saml2/sso",
  certificateFingerprint: "SHA256:7B:3E:91:02:FA:11:88:CD:94:12:00:E2:31:AA:BB:CC",
  scimSyncEnabled: true,
  isEnabled: true,
  enforceSso: false,
  autoProvision: true,
  activeDirectoryDomain: "acme-enterprises.onmicrosoft.com",
  azureTenantId: "a8109382-7102-48a1-b841-e94018290192",
  azureClientId: "39201948-5810-410a-8102-fa9018290391",
};

// --- 37. Diversity & Inclusion (D&I) Metrics ---
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

export const INITIAL_DIVERSITY_METRICS: DiversityMetrics = {
  genderRatio: [
    { category: "Female", count: 24, percentage: 48 },
    { category: "Male", count: 23, percentage: 46 },
    { category: "Non-Binary / Gender Diverse", count: 3, percentage: 6 },
  ],
  genderBreakdown: { female: 52, male: 45, nonBinary: 3 },
  ethnicityBreakdown: {
    asian: 34,
    white: 28,
    black: 18,
    hispanic: 16,
    multiracial: 4,
  },
  departmentParity: [
    { department: "Engineering", femalePct: 42, malePct: 53, nonBinaryPct: 5 },
    { department: "Product & Design", femalePct: 55, malePct: 40, nonBinaryPct: 5 },
    { department: "Revenue & Sales", femalePct: 50, malePct: 50, nonBinaryPct: 0 },
    { department: "People Operations", femalePct: 70, malePct: 25, nonBinaryPct: 5 },
  ],
  eeoCategoryCounts: [
    { category: "Executive / Senior Management", count: 5 },
    { category: "Professionals & Engineers", count: 32 },
    { category: "Sales Workers", count: 8 },
    { category: "Administrative Support", count: 5 },
  ],
  veteranPercentage: 8,
  remotePercentage: 65,
  leadershipFemalePercentage: 48,
};

// --- 38. Multi-Currency Configurations ---
export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "PKR" | "AED";

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1.0, label: "USD ($) US Dollar" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR (€) Euro" },
  GBP: { symbol: "£", rate: 0.77, label: "GBP (£) British Pound" },
  CAD: { symbol: "CA$", rate: 1.35, label: "CAD ($) Canadian Dollar" },
  PKR: { symbol: "Rs.", rate: 278.0, label: "PKR (Rs.) Pakistani Rupee" },
  AED: { symbol: "AED", rate: 3.67, label: "AED (د.إ) UAE Dirham" },
};

// --- 39. Custom Fields ---
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

export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: "cf_01",
    name: "tshirt_size",
    label: "Apparel T-Shirt Size",
    type: "dropdown",
    options: ["XS", "S", "M", "L", "XL", "2XL"],
    required: true,
    defaultValue: "L",
    category: "PREFERENCE",
  },
  {
    id: "cf_02",
    name: "emergency_contact",
    label: "Emergency Contact (Name & Phone)",
    type: "text",
    required: true,
    defaultValue: "Sarah Chen (+1 415-555-0199)",
    category: "PERSONAL",
  },
  {
    id: "cf_03",
    name: "clearance_level",
    label: "Security Clearance Level",
    type: "dropdown",
    options: ["None", "Public Trust", "Secret", "Top Secret"],
    required: false,
    defaultValue: "None",
    category: "COMPLIANCE",
  },
  {
    id: "cf_04",
    name: "dietary_preference",
    label: "Dietary & Catering Preferences",
    type: "dropdown",
    options: ["No Restrictions", "Vegetarian", "Vegan", "Halal", "Gluten-Free", "Kosher"],
    required: false,
    defaultValue: "No Restrictions",
    category: "PREFERENCE",
  },
  {
    id: "cf_05",
    name: "workstation_setup",
    label: "Workstation Ergonomics Preference",
    type: "dropdown",
    options: ["Standard Desk", "Standing Desk Motorized", "Dual Monitor Articulating Arm", "Split Ergonomic Setup"],
    required: false,
    defaultValue: "Standing Desk Motorized",
    category: "IT",
  },
];



