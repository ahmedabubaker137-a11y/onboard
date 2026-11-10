/**
 * OnboardX Client-Safe Enterprise Constants
 * 
 * Free of credentials, secrets, or server database objects.
 */

import { CurrencyCode, DiversityMetrics, CustomFieldDefinition } from "./types";

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1.0, label: "USD ($) US Dollar" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR (€) Euro" },
  GBP: { symbol: "£", rate: 0.77, label: "GBP (£) British Pound" },
  CAD: { symbol: "CA$", rate: 1.35, label: "CAD ($) Canadian Dollar" },
  PKR: { symbol: "Rs.", rate: 278.0, label: "PKR (Rs.) Pakistani Rupee" },
  AED: { symbol: "AED", rate: 3.67, label: "AED (د.إ) UAE Dirham" },
};

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
];
