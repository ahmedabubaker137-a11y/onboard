import { PrismaClient } from "@prisma/client";
import {
  INITIAL_COMPANY,
  INITIAL_DEPARTMENTS,
  INITIAL_TEMPLATES,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_BENEFITS,
  INITIAL_DOCUMENTS,
  INITIAL_ORG_CHART,
  INITIAL_AUDIT_LOGS,
  INITIAL_TICKETS,
  INITIAL_SURVEYS,
  INITIAL_WEBHOOKS,
  INITIAL_API_KEYS,
  INITIAL_DOCUMENT_TEMPLATES,
  INITIAL_TIME_OFF_POLICIES,
  INITIAL_CERTIFICATIONS,
  INITIAL_BACKGROUND_CHECKS,
  INITIAL_E_VERIFY_CASES,
  INITIAL_WHISTLEBLOWER_REPORTS,
  INITIAL_OFFICE_DESKS,
  INITIAL_SWAG_ORDERS,
  INITIAL_JOB_REQUISITIONS,
  INITIAL_SCORM_COURSES,
  INITIAL_SCHEDULED_REPORTS,
  INITIAL_CUSTOM_DOMAINS,
  INITIAL_SSO_CONFIG,
  INITIAL_DIVERSITY_METRICS,
  CURRENCY_RATES,
  EmployeeData,
  AssetData,
  DocumentItem,
  TemplateData,
  BenefitPlan,
  TicketItem,
  SurveyResponseItem,
  WebhookItem,
  ApiKeyItem,
  DocumentTemplateItem,
  TimeOffPolicyItem,
  CertificationItem,
  BackgroundCheckItem,
  EVerifyItem,
  WhistleblowerItem,
  OfficeDeskItem,
  SwagOrderItem,
  JobRequisitionItem,
  ScormCourseItem,
  ScheduledReportItem,
  CustomDomainItem,
  SsoConfigItem,
  DiversityMetrics,
  CurrencyCode,
  OrgNode,
  CustomFieldDefinition,
  INITIAL_CUSTOM_FIELDS,
} from "./data/mock-db";
import { createAuditLogEntry } from "./audit";

// Global Prisma Singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type { CustomFieldDefinition };

// Dynamic In-Memory Store for Real-Time State & Fallback
export class EnterpriseStore {
  private company = { ...INITIAL_COMPANY };
  private departments = [...INITIAL_DEPARTMENTS];
  private templates: TemplateData[] = JSON.parse(JSON.stringify(INITIAL_TEMPLATES));
  private employees: EmployeeData[] = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
  private assets: AssetData[] = JSON.parse(JSON.stringify(INITIAL_ASSETS));
  private benefits: BenefitPlan[] = JSON.parse(JSON.stringify(INITIAL_BENEFITS));
  private documents: DocumentItem[] = JSON.parse(JSON.stringify(INITIAL_DOCUMENTS));
  private auditLogs = [...INITIAL_AUDIT_LOGS];
  private tickets: TicketItem[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
  private surveys: SurveyResponseItem[] = JSON.parse(JSON.stringify(INITIAL_SURVEYS));
  private webhooks: WebhookItem[] = JSON.parse(JSON.stringify(INITIAL_WEBHOOKS));
  private apiKeys: ApiKeyItem[] = JSON.parse(JSON.stringify(INITIAL_API_KEYS));
  private documentTemplates: DocumentTemplateItem[] = JSON.parse(JSON.stringify(INITIAL_DOCUMENT_TEMPLATES));
  private timeOffPolicies: TimeOffPolicyItem[] = JSON.parse(JSON.stringify(INITIAL_TIME_OFF_POLICIES));
  private orgChart: OrgNode = JSON.parse(JSON.stringify(INITIAL_ORG_CHART));
  private certifications: CertificationItem[] = JSON.parse(JSON.stringify(INITIAL_CERTIFICATIONS));
  private backgroundChecks: BackgroundCheckItem[] = JSON.parse(JSON.stringify(INITIAL_BACKGROUND_CHECKS));
  private eVerifyCases: EVerifyItem[] = JSON.parse(JSON.stringify(INITIAL_E_VERIFY_CASES));
  private whistleblowerReports: WhistleblowerItem[] = JSON.parse(JSON.stringify(INITIAL_WHISTLEBLOWER_REPORTS));
  private officeDesks: OfficeDeskItem[] = JSON.parse(JSON.stringify(INITIAL_OFFICE_DESKS));
  private swagOrders: SwagOrderItem[] = JSON.parse(JSON.stringify(INITIAL_SWAG_ORDERS));
  private jobRequisitions: JobRequisitionItem[] = JSON.parse(JSON.stringify(INITIAL_JOB_REQUISITIONS));
  private scormCourses: ScormCourseItem[] = JSON.parse(JSON.stringify(INITIAL_SCORM_COURSES));
  private scheduledReports: ScheduledReportItem[] = JSON.parse(JSON.stringify(INITIAL_SCHEDULED_REPORTS));
  private customDomains: CustomDomainItem[] = JSON.parse(JSON.stringify(INITIAL_CUSTOM_DOMAINS));
  private ssoConfig: SsoConfigItem = JSON.parse(JSON.stringify(INITIAL_SSO_CONFIG));
  private diversityMetrics: DiversityMetrics = JSON.parse(JSON.stringify(INITIAL_DIVERSITY_METRICS));
  private currency: CurrencyCode = "USD";
  private customFields: CustomFieldDefinition[] = JSON.parse(JSON.stringify(INITIAL_CUSTOM_FIELDS));
  private lastLoadedMtime = 0;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    if (typeof window === "undefined") {
      try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const dir = path.join(process.cwd(), "data");
        const filePath = path.join(dir, "server-storage.json");
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs > this.lastLoadedMtime) {
            const raw = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(raw);
            if (data.company) this.company = data.company;
            if (data.departments) this.departments = data.departments;
            if (data.templates) this.templates = data.templates;
            if (data.employees) this.employees = data.employees;
            if (data.assets) this.assets = data.assets;
            if (data.benefits) this.benefits = data.benefits;
            if (data.documents) this.documents = data.documents;
            if (data.auditLogs) this.auditLogs = data.auditLogs;
            if (data.tickets) this.tickets = data.tickets;
            if (data.surveys) this.surveys = data.surveys;
            if (data.webhooks) this.webhooks = data.webhooks;
            if (data.apiKeys) this.apiKeys = data.apiKeys;
            if (data.documentTemplates) this.documentTemplates = data.documentTemplates;
            if (data.timeOffPolicies) this.timeOffPolicies = data.timeOffPolicies;
            if (data.orgChart) this.orgChart = data.orgChart;
            if (data.certifications) this.certifications = data.certifications;
            if (data.backgroundChecks) this.backgroundChecks = data.backgroundChecks;
            if (data.eVerifyCases) this.eVerifyCases = data.eVerifyCases;
            if (data.whistleblowerReports) this.whistleblowerReports = data.whistleblowerReports;
            if (data.officeDesks) this.officeDesks = data.officeDesks;
            if (data.swagOrders) this.swagOrders = data.swagOrders;
            if (data.jobRequisitions) this.jobRequisitions = data.jobRequisitions;
            if (data.scormCourses) this.scormCourses = data.scormCourses;
            if (data.scheduledReports) this.scheduledReports = data.scheduledReports;
            if (data.customDomains) this.customDomains = data.customDomains;
            if (data.ssoConfig) this.ssoConfig = data.ssoConfig;
            if (data.diversityMetrics) this.diversityMetrics = data.diversityMetrics;
            if (data.currency) this.currency = data.currency;
            if (data.customFields) this.customFields = data.customFields;
            this.lastLoadedMtime = stats.mtimeMs;
          }
        } else {
          this.persistToDisk();
        }
      } catch (err) {
        console.error("EnterpriseStore load error:", err);
      }
    }
  }

  private persistToDisk() {
    if (typeof window === "undefined") {
      try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const dir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, "server-storage.json");
        const payload = {
          company: this.company,
          departments: this.departments,
          templates: this.templates,
          employees: this.employees,
          assets: this.assets,
          benefits: this.benefits,
          documents: this.documents,
          auditLogs: this.auditLogs,
          tickets: this.tickets,
          surveys: this.surveys,
          webhooks: this.webhooks,
          apiKeys: this.apiKeys,
          documentTemplates: this.documentTemplates,
          timeOffPolicies: this.timeOffPolicies,
          orgChart: this.orgChart,
          certifications: this.certifications,
          backgroundChecks: this.backgroundChecks,
          eVerifyCases: this.eVerifyCases,
          whistleblowerReports: this.whistleblowerReports,
          officeDesks: this.officeDesks,
          swagOrders: this.swagOrders,
          jobRequisitions: this.jobRequisitions,
          scormCourses: this.scormCourses,
          scheduledReports: this.scheduledReports,
          customDomains: this.customDomains,
          ssoConfig: this.ssoConfig,
          diversityMetrics: this.diversityMetrics,
          currency: this.currency,
          customFields: this.customFields,
        };
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
        this.lastLoadedMtime = fs.statSync(filePath).mtimeMs;
      } catch (err) {
        console.error("EnterpriseStore persist error:", err);
      }
    }
  }

  // --- Company ---
  getCompany() {
    this.loadFromDisk();
    return this.company;
  }

  updateCompany(updates: Partial<typeof this.company>) {
    this.loadFromDisk();
    this.company = { ...this.company, ...updates };
    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "SETTINGS_UPDATED",
      "Company",
      this.company.id,
      updates as Record<string, unknown>
    );
    this.persistToDisk();
    return this.company;
  }

  getDepartments() {
    this.loadFromDisk();
    return this.departments;
  }

  // --- Templates ---
  getTemplates() {
    this.loadFromDisk();
    return this.templates;
  }

  createTemplate(template: TemplateData) {
    this.loadFromDisk();
    this.templates.unshift(template);
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "TEMPLATE_CREATED",
      "OnboardingTemplate",
      template.id,
      { title: template.title, role: template.targetRole }
    );
    this.persistToDisk();
    return template;
  }

  deleteTemplate(id: string) {
    this.loadFromDisk();
    const idx = this.templates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const removed = this.templates.splice(idx, 1)[0];
      this.addAuditLog(
        "marcus.thorne@acme-enterprises.com",
        "HR_MANAGER",
        "TEMPLATE_DELETED",
        "OnboardingTemplate",
        id,
        { title: removed.title }
      );
      this.persistToDisk();
      return true;
    }
    return false;
  }

  // --- Employees ---
  getEmployees() {
    this.loadFromDisk();
    return this.employees;
  }

  getEmployeeById(id: string) {
    this.loadFromDisk();
    return this.employees.find((e) => e.id === id) || null;
  }

  addEmployee(employee: EmployeeData) {
    this.loadFromDisk();
    this.employees.unshift(employee);
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "EMPLOYEE_CREATED",
      "Employee",
      employee.id,
      { name: `${employee.firstName} ${employee.lastName}`, title: employee.jobTitle, department: employee.department }
    );
    this.persistToDisk();
    return employee;
  }

  updateEmployee(id: string, updates: Partial<EmployeeData>) {
    this.loadFromDisk();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return null;
    Object.assign(emp, updates);
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "EMPLOYEE_UPDATED",
      "Employee",
      id,
      updates as Record<string, unknown>
    );
    this.persistToDisk();
    return emp;
  }

  bulkImportEmployees(csvText: string): EmployeeData[] {
    this.loadFromDisk();
    const lines = csvText.trim().split("\n");
    const newHires: EmployeeData[] = [];
    const template = this.templates[0];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && line.toLowerCase().includes("firstname"))) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length >= 3) {
        const [firstName, lastName, email, jobTitle, department, startDate] = cols;
        const newHire: EmployeeData = {
          id: `emp_${Date.now()}_${i}`,
          firstName: firstName || "New",
          lastName: lastName || "Employee",
          email: email || `user_${Date.now()}_${i}@acme.com`,
          jobTitle: jobTitle || "Specialist",
          department: department || "Engineering",
          managerName: "Sofia Calderon",
          startDate: startDate || new Date().toISOString().split("T")[0],
          status: "INVITED",
          progress: 0,
          avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 12345678) % 90000000000}?w=150&auto=format&fit=crop&q=80`,
          phone: "+1 (555) 456-7890",
          tasks: template.tasks.map((t, tIdx) => ({
            ...t,
            id: `task_bulk_${Date.now()}_${i}_${tIdx}`,
            status: "PENDING",
          })),
        };
        this.employees.unshift(newHire);
        newHires.push(newHire);
      }
    }

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "BULK_CSV_IMPORT",
      "Employee",
      `cohort_${Date.now()}`,
      { count: newHires.length }
    );
    this.persistToDisk();

    return newHires;
  }

  offboardEmployee(id: string, reason: string = "Standard Offboarding Protocol") {
    this.loadFromDisk();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return null;

    emp.status = "COMPLETED";

    // Unassign hardware assets
    const userAssets = this.assets.filter((a) => a.assignedToEmployeeId === id);
    userAssets.forEach((a) => {
      a.status = "AVAILABLE";
      a.assignedToEmployeeId = undefined;
      a.assignedToName = undefined;
    });

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "EMPLOYEE_OFFBOARDED",
      "Employee",
      id,
      { employee: `${emp.firstName} ${emp.lastName}`, reason, reclaimedAssets: userAssets.length }
    );
    this.persistToDisk();

    return { employee: emp, reclaimedAssets: userAssets.length };
  }

  anonymizeEmployee(id: string) {
    this.loadFromDisk();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return null;

    const originalName = `${emp.firstName} ${emp.lastName}`;
    emp.firstName = "GDPR-Anonymized";
    emp.lastName = `Employee [${id}]`;
    emp.email = `${id}@gdpr.internal`;
    emp.phone = "[REDACTED]";
    emp.avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    // Remove personal documents
    this.documents = this.documents.filter((d) => d.employeeId !== id);

    // Reclaim assets
    this.assets.forEach((a) => {
      if (a.assignedToEmployeeId === id) {
        a.status = "AVAILABLE";
        a.assignedToEmployeeId = undefined;
        a.assignedToName = undefined;
      }
    });

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "GDPR_ZEROIZATION_EXECUTED",
      "Employee",
      id,
      { originalSubject: originalName, protocol: "EU_GDPR_ARTICLE_17_RIGHT_TO_ERASURE" }
    );
    this.persistToDisk();

    return emp;
  }

  // --- Tasks ---
  updateTaskStatus(
    employeeIdOrTaskId: string,
    taskIdOrStatus: string,
    maybeStatus?: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "REJECTED"
  ) {
    this.loadFromDisk();
    let employeeId = employeeIdOrTaskId;
    let taskId = taskIdOrStatus;
    let status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "REJECTED" = (maybeStatus as any) || "COMPLETED";

    if (!maybeStatus) {
      taskId = employeeIdOrTaskId;
      status = taskIdOrStatus as any;
      const foundEmp = this.employees.find((e) => e.tasks.some((t) => t.id === taskId));
      if (!foundEmp) return null;
      employeeId = foundEmp.id;
    }

    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return null;

    const task = emp.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = status as any;
    if (status === "COMPLETED") {
      task.completedAt = new Date().toISOString();
      task.verifiedBy = "System Automated Verification";
    } else {
      task.completedAt = undefined;
      task.verifiedBy = undefined;
    }

    // Recalculate progress percentage
    const completedCount = emp.tasks.filter((t) => t.status === "COMPLETED").length;
    emp.progress = Math.round((completedCount / emp.tasks.length) * 100);
    if (emp.progress === 100) {
      emp.status = "COMPLETED";
    } else if (emp.progress > 0) {
      emp.status = "IN_PROGRESS";
    }

    this.addAuditLog(
      emp.email,
      "EMPLOYEE",
      "TASK_STATUS_UPDATED",
      "EmployeeTask",
      taskId,
      { taskTitle: task.title, newStatus: status, employeeProgress: emp.progress }
    );
    this.persistToDisk();

    return { employee: emp, task };
  }

  // --- Assets & Hardware ---
  getAssets() {
    this.loadFromDisk();
    return this.assets;
  }

  addAsset(asset: AssetData) {
    this.loadFromDisk();
    this.assets.unshift(asset);
    this.addAuditLog(
      "devon.reed@acme-enterprises.com",
      "IT_PROVISIONER",
      "ASSET_REGISTERED",
      "Asset",
      asset.id,
      { serial: asset.serialNumber, name: asset.name, model: asset.model }
    );
    this.persistToDisk();
    return asset;
  }

  assignAsset(assetId: string, employeeId: string) {
    this.loadFromDisk();
    const asset = this.assets.find((a) => a.id === assetId);
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!asset || !emp) return null;

    asset.status = "ASSIGNED";
    asset.assignedToEmployeeId = emp.id;
    asset.assignedToName = `${emp.firstName} ${emp.lastName}`;

    this.addAuditLog(
      "devon.reed@acme-enterprises.com",
      "IT_PROVISIONER",
      "ASSET_ASSIGNED",
      "Asset",
      asset.id,
      { serialNumber: asset.serialNumber, assignedTo: asset.assignedToName }
    );
    this.persistToDisk();

    return asset;
  }

  returnAsset(assetId: string) {
    this.loadFromDisk();
    const asset = this.assets.find((a) => a.id === assetId);
    if (!asset) return null;

    const previousAssignee = asset.assignedToName;
    asset.status = "AVAILABLE";
    asset.assignedToEmployeeId = undefined;
    asset.assignedToName = undefined;

    this.addAuditLog(
      "devon.reed@acme-enterprises.com",
      "IT_PROVISIONER",
      "ASSET_RETURNED",
      "Asset",
      asset.id,
      { serialNumber: asset.serialNumber, returnedFrom: previousAssignee }
    );
    this.persistToDisk();

    return asset;
  }

  // --- Benefits ---
  getBenefits() {
    this.loadFromDisk();
    return this.benefits;
  }

  toggleBenefit(benefitId: string) {
    this.loadFromDisk();
    const benefit = this.benefits.find((b) => b.id === benefitId);
    if (!benefit) return null;
    benefit.isElected = !benefit.isElected;

    this.addAuditLog(
      "kaelen.chen@acme-enterprises.com",
      "EMPLOYEE",
      "BENEFIT_ELECTION_CHANGED",
      "Benefit",
      benefit.id,
      { planName: benefit.name, elected: benefit.isElected, costMonthly: benefit.costMonthly }
    );
    this.persistToDisk();

    return benefit;
  }

  // --- Documents & Templates ---
  getDocuments(employeeId?: string) {
    this.loadFromDisk();
    if (employeeId) {
      return this.documents.filter((d) => d.employeeId === employeeId);
    }
    return this.documents;
  }

  addDocument(doc: DocumentItem) {
    this.loadFromDisk();
    this.documents.unshift(doc);
    this.addAuditLog(
      "kaelen.chen@acme-enterprises.com",
      "EMPLOYEE",
      "DOCUMENT_UPLOADED",
      "Document",
      doc.id,
      { title: doc.title, fileType: doc.fileType, fileSize: doc.fileSize }
    );
    this.persistToDisk();
    return doc;
  }

  signDocument(documentId: string, cryptoSignatureHash: string, signerEmail: string) {
    this.loadFromDisk();
    const doc = this.documents.find((d) => d.id === documentId);
    if (!doc) return null;

    doc.isSigned = true;
    doc.signedAt = new Date().toISOString();
    doc.cryptoSignatureHash = cryptoSignatureHash;
    doc.status = "APPROVED";

    this.addAuditLog(
      signerEmail,
      "EMPLOYEE",
      "DOCUMENT_SIGNED",
      "Document",
      documentId,
      { documentTitle: doc.title, sha256Signature: cryptoSignatureHash }
    );
    this.persistToDisk();

    return doc;
  }

  getDocumentTemplates() {
    this.loadFromDisk();
    return this.documentTemplates;
  }

  createDocumentTemplate(tpl: DocumentTemplateItem) {
    this.loadFromDisk();
    this.documentTemplates.unshift(tpl);
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "DOCUMENT_TEMPLATE_CREATED",
      "DocumentTemplate",
      tpl.id,
      { title: tpl.title, category: tpl.category, version: tpl.version }
    );
    this.persistToDisk();
    return tpl;
  }

  assignDocument(templateTitle: string, employeeId: string) {
    this.loadFromDisk();
    const emp = this.employees.find((e) => e.id === employeeId);
    const docItem: DocumentItem = {
      id: `doc_tpl_${Date.now()}`,
      title: templateTitle,
      fileType: "PDF",
      fileSize: "1.5 MB",
      isSigned: false,
      status: "PENDING",
      employeeId,
    };
    this.documents.unshift(docItem);

    if (emp) {
      const hasTask = emp.tasks.some((t) => t.title.toLowerCase().includes(templateTitle.toLowerCase()));
      if (!hasTask) {
        emp.tasks.push({
          id: `task_doc_${Date.now()}`,
          title: `Sign ${templateTitle}`,
          description: `Review, complete compliance questionnaire, and cryptographically sign agreement.`,
          status: "PENDING",
          category: "LEGAL_DOCUMENT",
          assignedTo: "EMPLOYEE",
          dueDays: 1,
        });
        const completedCount = emp.tasks.filter((t) => t.status === "COMPLETED").length;
        emp.progress = Math.round((completedCount / emp.tasks.length) * 100);
      }
    }

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "DOCUMENT_TEMPLATE_ASSIGNED",
      "Document",
      docItem.id,
      { title: templateTitle, assignedTo: employeeId }
    );
    this.persistToDisk();

    return { document: docItem, employee: emp };
  }

  // --- Tickets ---
  getTickets() {
    this.loadFromDisk();
    return this.tickets;
  }

  createTicket(ticket: Omit<TicketItem, "id" | "createdAt" | "status">) {
    this.loadFromDisk();
    const newTicket: TicketItem = {
      ...ticket,
      id: `tkt_${Date.now()}`,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);

    this.addAuditLog(
      "kaelen.chen@acme-enterprises.com",
      "EMPLOYEE",
      "IT_TICKET_CREATED",
      "Ticket",
      newTicket.id,
      { title: newTicket.title, category: newTicket.category, priority: newTicket.priority }
    );
    this.persistToDisk();

    return newTicket;
  }

  // --- Surveys & eNPS ---
  getSurveys() {
    this.loadFromDisk();
    return this.surveys;
  }

  submitSurvey(survey: Omit<SurveyResponseItem, "id" | "createdAt">) {
    this.loadFromDisk();
    const newSurvey: SurveyResponseItem = {
      ...survey,
      id: `srv_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.surveys.unshift(newSurvey);

    this.addAuditLog(
      survey.employeeName,
      "EMPLOYEE",
      "SURVEY_SUBMITTED",
      "SurveyResponse",
      newSurvey.id,
      { type: survey.surveyType, score: survey.score }
    );
    this.persistToDisk();

    return newSurvey;
  }

  getENPS(): number {
    this.loadFromDisk();
    if (this.surveys.length === 0) return 78;
    const promoters = this.surveys.filter((s) => s.score >= 9).length;
    const detractors = this.surveys.filter((s) => s.score <= 6).length;
    return Math.round(((promoters - detractors) / this.surveys.length) * 100);
  }

  // --- Webhooks ---
  getWebhooks() {
    this.loadFromDisk();
    return this.webhooks;
  }

  addWebhook(webhook: Omit<WebhookItem, "id" | "createdAt">) {
    this.loadFromDisk();
    const newWh: WebhookItem = {
      ...webhook,
      id: `wh_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastDeliveryStatus: "SUCCESS",
      lastDeliveredAt: new Date().toISOString(),
    };
    this.webhooks.unshift(newWh);

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "WEBHOOK_CREATED",
      "Webhook",
      newWh.id,
      { url: newWh.url, events: newWh.events }
    );
    this.persistToDisk();

    return newWh;
  }

  testWebhook(id: string) {
    this.loadFromDisk();
    const wh = this.webhooks.find((w) => w.id === id);
    if (!wh) return null;

    wh.lastDeliveredAt = new Date().toISOString();
    wh.lastDeliveryStatus = "SUCCESS";

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "WEBHOOK_TEST_DISPATCHED",
      "Webhook",
      id,
      { url: wh.url, status: 200, responsePayload: '{"delivered":true}' }
    );
    this.persistToDisk();

    return wh;
  }

  deleteWebhook(id: string) {
    this.loadFromDisk();
    const idx = this.webhooks.findIndex((w) => w.id === id);
    if (idx !== -1) {
      const removed = this.webhooks.splice(idx, 1)[0];
      this.addAuditLog(
        "eleanor.vance@acme-enterprises.com",
        "ADMIN",
        "WEBHOOK_DELETED",
        "Webhook",
        id,
        { url: removed.url }
      );
      this.persistToDisk();
      return true;
    }
    return false;
  }

  // --- API Keys ---
  getApiKeys() {
    this.loadFromDisk();
    return this.apiKeys.map(({ fullToken, ...safeKey }) => safeKey);
  }

  createApiKey(name: string, role: string) {
    this.loadFromDisk();
    const rawSecret = `obx_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      keyPrefix: `${rawSecret.substring(0, 16)}...`,
      fullToken: rawSecret,
      role,
      createdAt: new Date().toISOString(),
      lastUsedAt: "Just now",
    };
    this.apiKeys.unshift(newKey);

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "API_KEY_GENERATED",
      "ApiKey",
      newKey.id,
      { name, role, prefix: newKey.keyPrefix }
    );
    this.persistToDisk();

    return newKey;
  }

  revokeApiKey(id: string) {
    this.loadFromDisk();
    const idx = this.apiKeys.findIndex((k) => k.id === id);
    if (idx !== -1) {
      const removed = this.apiKeys.splice(idx, 1)[0];
      this.addAuditLog(
        "eleanor.vance@acme-enterprises.com",
        "ADMIN",
        "API_KEY_REVOKED",
        "ApiKey",
        id,
        { name: removed.name }
      );
      this.persistToDisk();
      return true;
    }
    return false;
  }

  // --- Time-Off Policies ---
  getTimeOffPolicies() {
    this.loadFromDisk();
    return this.timeOffPolicies;
  }

  addTimeOffPolicy(policy: TimeOffPolicyItem) {
    this.loadFromDisk();
    this.timeOffPolicies.push(policy);
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "TIME_OFF_POLICY_CREATED",
      "TimeOffPolicy",
      policy.id,
      { name: policy.name, daysPerYear: policy.daysPerYear, accrualFrequency: policy.accrualFrequency }
    );
    this.persistToDisk();
    return policy;
  }

  updateTimeOffPolicies(policies: TimeOffPolicyItem[]) {
    this.loadFromDisk();
    this.timeOffPolicies = policies;
    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "TIME_OFF_POLICIES_UPDATED",
      "TimeOffPolicy",
      "policies_batch",
      { count: policies.length }
    );
    this.persistToDisk();
    return this.timeOffPolicies;
  }

  // --- Org Chart ---
  getOrgChart() {
    this.loadFromDisk();
    return this.orgChart;
  }

  addOrgMember(managerId: string, member: Omit<OrgNode, "reports">) {
    this.loadFromDisk();
    const findAndAdd = (node: OrgNode): boolean => {
      if (node.id === managerId) {
        if (!node.reports) node.reports = [];
        node.reports.push({ ...member });
        return true;
      }
      if (node.reports) {
        for (const child of node.reports) {
          if (findAndAdd(child)) return true;
        }
      }
      return false;
    };

    const added = findAndAdd(this.orgChart);
    if (added) {
      this.addAuditLog(
        "marcus.thorne@acme-enterprises.com",
        "HR_MANAGER",
        "ORG_MEMBER_ADDED",
        "TeamMember",
        member.id,
        { name: member.name, role: member.role, managerId }
      );
      this.persistToDisk();
    }
    return added;
  }

  // --- Audit Logs ---
  getAuditLogs() {
    this.loadFromDisk();
    return this.auditLogs;
  }

  addAuditLog(
    actorEmail: string,
    actorRole: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown>
  ) {
    const entry = createAuditLogEntry(
      actorEmail,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      this.company.id
    );
    this.auditLogs.unshift(entry);
    this.persistToDisk();
    return entry;
  }

  // --- Certifications & Expiry Tracking ---
  getCertifications(employeeId?: string) {
    this.loadFromDisk();
    if (employeeId) {
      return this.certifications.filter((c) => c.employeeId === employeeId);
    }
    return this.certifications;
  }

  addCertification(cert: Omit<CertificationItem, "id" | "status" | "daysUntilExpiry">) {
    this.loadFromDisk();
    const expiry = new Date(cert.expiryDate).getTime();
    const now = Date.now();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    const status: CertificationItem["status"] =
      daysUntilExpiry < 0 ? "EXPIRED" : daysUntilExpiry <= 30 ? "EXPIRING_SOON" : "ACTIVE";

    const newCert: CertificationItem = {
      ...cert,
      id: `cert_${Date.now()}`,
      status,
      daysUntilExpiry,
    };
    this.certifications.unshift(newCert);

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "CERTIFICATION_REGISTERED",
      "Certification",
      newCert.id,
      { employee: cert.employeeName, certName: cert.name, expiryDate: cert.expiryDate, status }
    );
    this.persistToDisk();
    return newCert;
  }

  renewCertification(id: string, newExpiryDate: string) {
    this.loadFromDisk();
    const cert = this.certifications.find((c) => c.id === id);
    if (!cert) return null;
    cert.expiryDate = newExpiryDate;
    const expiry = new Date(newExpiryDate).getTime();
    const now = Date.now();
    cert.daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    cert.status = cert.daysUntilExpiry <= 30 ? "EXPIRING_SOON" : "ACTIVE";

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "CERTIFICATION_RENEWED",
      "Certification",
      cert.id,
      { employee: cert.employeeName, certName: cert.name, newExpiryDate }
    );
    this.persistToDisk();
    return cert;
  }

  // --- Background Checks & Checkr ---
  getBackgroundChecks() {
    this.loadFromDisk();
    return this.backgroundChecks;
  }

  createBackgroundCheck(item: Omit<BackgroundCheckItem, "id" | "status" | "turnaroundDays">) {
    this.loadFromDisk();
    const newCheck: BackgroundCheckItem = {
      ...item,
      id: `chk_${Date.now()}`,
      status: "CLEAR",
      turnaroundDays: 2,
      completedAt: new Date().toISOString(),
    };
    this.backgroundChecks.unshift(newCheck);

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "BACKGROUND_CHECK_COMPLETED",
      "BackgroundCheck",
      newCheck.id,
      { candidate: newCheck.candidateName, provider: newCheck.provider, status: newCheck.status }
    );
    this.persistToDisk();
    return newCheck;
  }

  // --- DHS E-Verify US Compliance ---
  getEVerifyCases() {
    this.loadFromDisk();
    return this.eVerifyCases;
  }

  verifyEVerifyCase(employeeId: string, employeeName: string, documentType: EVerifyItem["documentType"]) {
    this.loadFromDisk();
    const caseNumber = `2026-EV-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newCase: EVerifyItem = {
      id: `ev_${Date.now()}`,
      employeeId,
      employeeName,
      caseNumber,
      documentType,
      status: "EMPLOYMENT_AUTHORIZED",
      submissionDate: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      eligibilityCode: "DHS-AUTH-A109",
    };
    this.eVerifyCases.unshift(newCase);

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "E_VERIFY_AUTHORIZED",
      "EVerifyCase",
      newCase.id,
      { employeeName, caseNumber, eligibilityCode: newCase.eligibilityCode }
    );
    this.persistToDisk();
    return newCase;
  }

  // --- Anonymous Whistleblower Complaints ---
  getWhistleblowerReports() {
    this.loadFromDisk();
    return this.whistleblowerReports;
  }

  getWhistleblowerReportByToken(token: string) {
    this.loadFromDisk();
    return this.whistleblowerReports.find((r) => r.trackingToken === token) || null;
  }

  submitWhistleblowerReport(report: { category: WhistleblowerItem["category"]; subject: string; details: string }) {
    this.loadFromDisk();
    const secretToken = `wbt_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newReport: WhistleblowerItem = {
      id: `wb_${Date.now()}`,
      trackingToken: secretToken,
      category: report.category,
      subject: report.subject,
      details: report.details,
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
    };
    this.whistleblowerReports.unshift(newReport);

    // Cryptographic audit without identifying reporter
    this.addAuditLog(
      "anonymous-reporter@onboardx.privacy",
      "WHISTLEBLOWER",
      "ANONYMOUS_REPORT_FILED",
      "WhistleblowerReport",
      newReport.id,
      { category: report.category, trackingTokenHash: secretToken.substring(0, 10) + "..." }
    );
    this.persistToDisk();
    return newReport;
  }

  // --- Office Desks & Floorplan ---
  getOfficeDesks() {
    this.loadFromDisk();
    return this.officeDesks;
  }

  assignDesk(deskId: string, employeeId: string, employeeName: string) {
    this.loadFromDisk();
    const desk = this.officeDesks.find((d) => d.id === deskId);
    if (!desk) return null;

    desk.status = "OCCUPIED";
    desk.assignedToId = employeeId;
    desk.assignedToName = employeeName;

    this.addAuditLog(
      "devon.reed@acme-enterprises.com",
      "IT_PROVISIONER",
      "OFFICE_DESK_ASSIGNED",
      "OfficeDesk",
      deskId,
      { deskCode: desk.deskCode, assignedTo: employeeName }
    );
    this.persistToDisk();
    return desk;
  }

  assignOfficeDesk(deskId: string, employeeId: string | null, employeeName: string | null) {
    this.loadFromDisk();
    const desk = this.officeDesks.find((d) => d.id === deskId);
    if (!desk) return null;

    desk.status = employeeId ? "OCCUPIED" : "AVAILABLE";
    desk.assignedToId = employeeId || undefined;
    desk.assignedToName = employeeName || undefined;

    this.addAuditLog(
      "devon.reed@acme-enterprises.com",
      "IT_PROVISIONER",
      employeeId ? "OFFICE_DESK_ASSIGNED" : "OFFICE_DESK_RELEASED",
      "OfficeDesk",
      deskId,
      { deskCode: desk.deskCode, assignedTo: employeeName || "None (Released)" }
    );
    this.persistToDisk();
    return desk;
  }

  // --- Swag Orders ---
  getSwagOrders(employeeId?: string) {
    this.loadFromDisk();
    if (employeeId) {
      return this.swagOrders.filter((o) => o.employeeId === employeeId);
    }
    return this.swagOrders;
  }

  createSwagOrder(order: Omit<SwagOrderItem, "id" | "status" | "carrier" | "trackingNumber" | "dispatchedAt">) {
    this.loadFromDisk();
    const newOrder: SwagOrderItem = {
      ...order,
      id: `swag_${Date.now()}`,
      status: "DISPATCHED",
      carrier: "FedEx Priority Express",
      trackingNumber: `FDX-${Math.floor(100000000 + Math.random() * 900000000)}-US`,
      dispatchedAt: new Date().toISOString(),
    };
    this.swagOrders.unshift(newOrder);

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "SWAG_KIT_DISPATCHED",
      "SwagOrder",
      newOrder.id,
      { employee: order.employeeName, shirtSize: order.shirtSize, tracking: newOrder.trackingNumber }
    );
    this.persistToDisk();
    return newOrder;
  }

  // --- Job Requisitions ---
  getJobRequisitions() {
    this.loadFromDisk();
    return this.jobRequisitions;
  }

  createJobRequisition(req: Omit<JobRequisitionItem, "id" | "requisitionCode" | "createdAt">) {
    this.loadFromDisk();
    const code = `REQ-${req.department.substring(0, 3).toUpperCase()}-2026-${Math.floor(10 + Math.random() * 90)}`;
    const newReq: JobRequisitionItem = {
      ...req,
      id: `req_${Date.now()}`,
      requisitionCode: code,
      createdAt: new Date().toISOString(),
    };
    this.jobRequisitions.unshift(newReq);

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "JOB_REQUISITION_CREATED",
      "JobRequisition",
      newReq.id,
      { code, title: newReq.title, department: newReq.department }
    );
    this.persistToDisk();
    return newReq;
  }

  updateJobRequisitionStatus(id: string, status: JobRequisitionItem["status"]) {
    this.loadFromDisk();
    const req = this.jobRequisitions.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "JOB_REQUISITION_UPDATED",
      "JobRequisition",
      id,
      { requisitionCode: req.requisitionCode, newStatus: status }
    );
    this.persistToDisk();
    return req;
  }

  // --- SCORM Courses ---
  getScormCourses() {
    this.loadFromDisk();
    return this.scormCourses;
  }

  updateScormProgress(
    courseId: string,
    updates: {
      score?: number;
      status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      progress?: number;
      timeSpentMinutes?: number;
    }
  ) {
    this.loadFromDisk();
    const course = this.scormCourses.find((c) => c.id === courseId);
    if (!course) return null;

    if (updates.score !== undefined) course.score = updates.score;
    if (updates.status) course.status = updates.status;
    if (updates.progress !== undefined) course.progress = updates.progress;
    if (updates.timeSpentMinutes !== undefined) course.timeSpentMinutes = updates.timeSpentMinutes;

    this.addAuditLog(
      "scorm-engine@acme-enterprises.com",
      "SYSTEM",
      "SCORM_PROGRESS_UPDATED",
      "ScormCourse",
      courseId,
      { courseTitle: course.title, updates }
    );
    this.persistToDisk();

    return course;
  }

  recordScormCompletion(courseId: string, employeeId: string, employeeName: string, score: number) {
    this.loadFromDisk();
    const course = this.scormCourses.find((c) => c.id === courseId);
    if (!course) return null;

    const passed = score >= course.passingScore;
    if (passed) {
      const emp = this.employees.find((e) => e.id === employeeId);
      if (emp) {
        const trainingTask = emp.tasks.find((t) => t.category === "TRAINING" && t.status !== "COMPLETED");
        if (trainingTask) {
          trainingTask.status = "COMPLETED";
          trainingTask.completedAt = new Date().toISOString();
          trainingTask.verifiedBy = `SCORM Engine (${course.version})`;
          const completedCount = emp.tasks.filter((t) => t.status === "COMPLETED").length;
          emp.progress = Math.round((completedCount / emp.tasks.length) * 100);
        }
      }
    }

    this.addAuditLog(
      "scorm-engine@acme-enterprises.com",
      "SYSTEM",
      "SCORM_MODULE_EVALUATED",
      "ScormCourse",
      courseId,
      { employee: employeeName, score, passed, courseTitle: course.title }
    );
    this.persistToDisk();

    return { course, passed, score };
  }

  // --- Scheduled Reports ---
  getScheduledReports() {
    this.loadFromDisk();
    return this.scheduledReports;
  }

  createScheduledReport(report: Omit<ScheduledReportItem, "id" | "createdAt" | "nextRunAt">) {
    this.loadFromDisk();
    const newRep: ScheduledReportItem = {
      ...report,
      id: `sch_${Date.now()}`,
      nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.scheduledReports.unshift(newRep);

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "SCHEDULED_REPORT_CONFIGURED",
      "ScheduledReport",
      newRep.id,
      { name: newRep.name, frequency: newRep.frequency }
    );
    this.persistToDisk();
    return newRep;
  }

  runScheduledReportNow(id: string) {
    this.loadFromDisk();
    const rep = this.scheduledReports.find((r) => r.id === id);
    if (!rep) return null;
    rep.lastRunAt = new Date().toISOString();

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "SCHEDULED_REPORT_DISPATCHED",
      "ScheduledReport",
      id,
      { name: rep.name, recipients: rep.recipients }
    );
    this.persistToDisk();
    return rep;
  }

  // --- Custom Domains ---
  getCustomDomains() {
    this.loadFromDisk();
    return this.customDomains;
  }

  addCustomDomain(domain: string) {
    this.loadFromDisk();
    const newDom: CustomDomainItem = {
      id: `dom_${Date.now()}`,
      domain,
      cnameTarget: "cname.onboardx.io",
      sslStatus: "ACTIVE",
      dnsVerified: true,
    };
    this.customDomains.push(newDom);

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "CUSTOM_DOMAIN_ADDED",
      "TenantDomain",
      newDom.id,
      { domain, cname: newDom.cnameTarget }
    );
    this.persistToDisk();
    return newDom;
  }

  // --- SSO Configuration ---
  getSsoConfig() {
    this.loadFromDisk();
    return this.ssoConfig;
  }

  updateSsoConfig(updates: Partial<SsoConfigItem>) {
    this.loadFromDisk();
    this.ssoConfig = { ...this.ssoConfig, ...updates };

    this.addAuditLog(
      "eleanor.vance@acme-enterprises.com",
      "ADMIN",
      "SSO_CONFIG_UPDATED",
      "SsoConfiguration",
      "sso_primary",
      updates as Record<string, unknown>
    );
    this.persistToDisk();
    return this.ssoConfig;
  }

  // --- Custom Fields ---
  getCustomFields() {
    this.loadFromDisk();
    return this.customFields;
  }

  addCustomField(field: Omit<CustomFieldDefinition, "id">) {
    const newField: CustomFieldDefinition = {
      ...field,
      id: `cf_${Date.now()}`,
    };
    this.customFields.push(newField);
    this.persistToDisk();

    this.addAuditLog(
      "marcus.thorne@acme-enterprises.com",
      "HR_MANAGER",
      "CUSTOM_FIELD_CREATED",
      "CustomField",
      newField.id,
      { label: newField.label, type: newField.type }
    );
    return newField;
  }

  updateEmployeeCustomFields(
    employeeId: string,
    values: Record<string, string | number | boolean>,
    actorEmail: string = "marcus.thorne@acme-enterprises.com"
  ) {
    this.loadFromDisk();
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return null;

    emp.customFieldValues = {
      ...(emp.customFieldValues || {}),
      ...values,
    };

    this.persistToDisk();

    this.addAuditLog(
      actorEmail,
      "HR_MANAGER",
      "EMPLOYEE_CUSTOM_FIELDS_UPDATED",
      "Employee",
      employeeId,
      { updatedKeys: Object.keys(values) }
    );

    return emp;
  }

  // --- Diversity Metrics & Currency ---
  getDiversityMetrics() {
    this.loadFromDisk();
    return this.diversityMetrics;
  }

  getCurrency(): CurrencyCode {
    this.loadFromDisk();
    return this.currency;
  }

  setCurrency(curr: CurrencyCode) {
    this.loadFromDisk();
    this.currency = curr;
    this.persistToDisk();
    return this.currency;
  }
}

// Preserve Singleton across Next.js reloads
const globalForStore = globalThis as unknown as { enterpriseStore?: EnterpriseStore };
export const store = globalForStore.enterpriseStore || new EnterpriseStore();
if (process.env.NODE_ENV !== "production") globalForStore.enterpriseStore = store;
