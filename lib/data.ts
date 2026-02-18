import type { Invoice } from "@/components/dashboard/invoices-table"

// ========================
// Customer Currency Mapping (Document Currency)
// ========================
export interface CustomerCurrencyMapping {
  customer: string
  documentCurrency: string // Customer's transaction currency (e.g., AUD for ANZ)
}

export const customerCurrencyMappings: CustomerCurrencyMapping[] = [
  { customer: "Acme Corp", documentCurrency: "USD" },
  { customer: "TechStart Inc", documentCurrency: "USD" },
  { customer: "Enterprise Co", documentCurrency: "AUD" },
  { customer: "Global Systems", documentCurrency: "EUR" },
  { customer: "Innovation Labs", documentCurrency: "USD" },
  { customer: "Tech Solutions", documentCurrency: "SGD" },
  { customer: "DataCorp Inc", documentCurrency: "INR" },
  { customer: "CloudNet Services", documentCurrency: "GBP" },
]

// ========================
// Get customer's document currency
// ========================
export function getCustomerDocumentCurrency(customer: string): string {
  const mapping = customerCurrencyMappings.find((m) => m.customer === customer)
  return mapping?.documentCurrency || "USD"
}

// ========================
// Enrich invoices with document currency
// ========================
export function enrichInvoicesWithDocumentCurrency(invoices: Invoice[]): Invoice[] {
  return invoices.map((invoice) => ({
    ...invoice,
    documentCurrency: getCustomerDocumentCurrency(invoice.customer),
  }))
}

// ========================
// Ownership Mapping
// ========================
export interface OwnershipMapping {
  customer: string
  financeAgent: string
  deliveryManager: string
  pm: string
  bu: string
}

export const ownershipMappings: OwnershipMapping[] = [
  { customer: "Acme Corp", financeAgent: "Venki", deliveryManager: "Ashish", pm: "Sanjay Guha", bu: "RMD" },
  { customer: "TechStart Inc", financeAgent: "Venki", deliveryManager: "Ashish", pm: "Sanjay Guha", bu: "RMD" },
  { customer: "Enterprise Co", financeAgent: "Priya", deliveryManager: "Ravi Kumar", pm: "Meera Nair", bu: "CSD" },
  { customer: "Global Systems", financeAgent: "Priya", deliveryManager: "Ravi Kumar", pm: "Meera Nair", bu: "CSD" },
  { customer: "Innovation Labs", financeAgent: "Venki", deliveryManager: "Ashish", pm: "Deepak Roy", bu: "RMD" },
  { customer: "Tech Solutions", financeAgent: "Priya", deliveryManager: "Sunil Menon", pm: "Deepak Roy", bu: "EAS" },
  { customer: "DataCorp Inc", financeAgent: "Amit", deliveryManager: "Sunil Menon", pm: "Sanjay Guha", bu: "EAS" },
  { customer: "CloudNet Services", financeAgent: "Amit", deliveryManager: "Ravi Kumar", pm: "Meera Nair", bu: "CSD" },
]

// ========================
// Hierarchy Mapping
// ========================
export interface HierarchyEntry {
  person: string
  role: "finance_agent" | "delivery_manager" | "project_manager" | "bu_head"
  bu: string
  reportsTo: string
}

export const hierarchyMappings: HierarchyEntry[] = [
  { person: "Venki", role: "finance_agent", bu: "RMD", reportsTo: "Girish" },
  { person: "Priya", role: "finance_agent", bu: "CSD", reportsTo: "Girish" },
  { person: "Amit", role: "finance_agent", bu: "EAS", reportsTo: "Girish" },
  { person: "Ashish", role: "delivery_manager", bu: "RMD", reportsTo: "Girish" },
  { person: "Ravi Kumar", role: "delivery_manager", bu: "CSD", reportsTo: "Girish" },
  { person: "Sunil Menon", role: "delivery_manager", bu: "EAS", reportsTo: "Girish" },
  { person: "Sanjay Guha", role: "project_manager", bu: "RMD", reportsTo: "Ashish" },
  { person: "Meera Nair", role: "project_manager", bu: "CSD", reportsTo: "Ravi Kumar" },
  { person: "Deepak Roy", role: "project_manager", bu: "EAS", reportsTo: "Sunil Menon" },
  { person: "Girish", role: "bu_head", bu: "ALL", reportsTo: "" },
]

// ========================
// Roles and BUs
// ========================
export const roles = [
  { value: "all", label: "All Roles" },
  { value: "finance_agent", label: "Finance Agent" },
  { value: "delivery_manager", label: "Delivery Manager" },
  { value: "project_manager", label: "Project Manager" },
  { value: "bu_head", label: "BU Head" },
]

export const businessUnits = [
  { value: "all", label: "All BUs" },
  { value: "RMD", label: "RMD" },
  { value: "CSD", label: "CSD" },
  { value: "EAS", label: "EAS" },
]

// ========================
// Derive portfolio owners from hierarchy
// ========================
export function getPortfolioOwners(roleFilter: string, buFilter: string): string[] {
  return hierarchyMappings
    .filter((h) => {
      const matchesRole = roleFilter === "all" || h.role === roleFilter
      const matchesBu = buFilter === "all" || h.bu === buFilter || h.bu === "ALL"
      return matchesRole && matchesBu
    })
    .map((h) => h.person)
}

// ========================
// Filter invoices by selected owners
// ========================
export function getCustomersForOwners(selectedOwners: string[]): string[] {
  if (selectedOwners.length === 0) return ownershipMappings.map((m) => m.customer)

  const customerSet = new Set<string>()
  for (const owner of selectedOwners) {
    for (const mapping of ownershipMappings) {
      if (
        mapping.financeAgent === owner ||
        mapping.deliveryManager === owner ||
        mapping.pm === owner
      ) {
        customerSet.add(mapping.customer)
      }
    }
    // BU Head sees everything
    const entry = hierarchyMappings.find((h) => h.person === owner)
    if (entry?.role === "bu_head") {
      for (const mapping of ownershipMappings) {
        customerSet.add(mapping.customer)
      }
    }
  }
  return Array.from(customerSet)
}

export function filterInvoicesByOwners(invoices: Invoice[], selectedOwners: string[]): Invoice[] {
  if (selectedOwners.length === 0) return invoices
  const allowedCustomers = getCustomersForOwners(selectedOwners)
  return invoices.filter((inv) => allowedCustomers.includes(inv.customer))
}

export function filterInvoicesByBU(invoices: Invoice[], bu: string): Invoice[] {
  if (bu === "all") return invoices
  const buCustomers = ownershipMappings
    .filter((m) => m.bu === bu)
    .map((m) => m.customer)
  return invoices.filter((inv) => buCustomers.includes(inv.customer))
}

// ========================
// Apply role-based BU restrictions
// ========================
export function applyRoleBasedFilters(invoices: Invoice[], currentUser: string): Invoice[] {
  const userHierarchy = hierarchyMappings.find((h) => h.person === currentUser)
  
  // If user is Girish (BU Head), show only RMD3 data
  if (currentUser === "Girish" && userHierarchy?.role === "bu_head") {
    return invoices.filter((inv) => {
      const mapping = ownershipMappings.find((m) => m.customer === inv.customer)
      return mapping?.bu === "RMD"
    })
  }
  
  // For other BU heads, show their BU only
  if (userHierarchy?.role === "bu_head" && userHierarchy.bu !== "ALL") {
    return invoices.filter((inv) => {
      const mapping = ownershipMappings.find((m) => m.customer === inv.customer)
      return mapping?.bu === userHierarchy.bu
    })
  }
  
  return invoices
}

// ========================
// Compute KPIs dynamically from filtered invoices
// ========================
export function computeKPIs(invoices: Invoice[]) {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.value, 0)
  const overdueInvoices = invoices.filter((inv) => inv.overdue)
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.value, 0)
  const nonOverdue = invoices.filter((inv) => !inv.overdue)
  const partiallyPaid = nonOverdue.reduce((sum, inv) => sum + (inv.previousOutstandingAmount > 0 ? inv.previousOutstandingAmount : 0), 0)
  const collectionTarget = invoices.reduce((sum, inv) => sum + inv.collectionTarget, 0)
  const avgCreditPeriod = invoices.length > 0
    ? Math.round(invoices.reduce((sum, inv) => sum + inv.creditPeriod, 0) / invoices.length)
    : 0
  const penalInterestCount = invoices.filter((inv) => inv.penalInterest).length

  return {
    totalOutstanding,
    overdueAmount,
    partiallyPaid,
    committedPayments: collectionTarget,
    dso: avgCreditPeriod,
    avgDaysToPay: Math.round(avgCreditPeriod * 0.85),
  }
}

// ========================
// Compute aging buckets from filtered invoices
// ========================
export function computeAgingBuckets(invoices: Invoice[]) {
  const now = new Date()
  const buckets: Record<string, { invoiceCount: number; totalAmount: number }> = {
    "0-30": { invoiceCount: 0, totalAmount: 0 },
    "31-60": { invoiceCount: 0, totalAmount: 0 },
    "61-90": { invoiceCount: 0, totalAmount: 0 },
    "90+": { invoiceCount: 0, totalAmount: 0 },
  }

  for (const inv of invoices) {
    const invoiceDate = new Date(inv.invoiceDate)
    const daysOld = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))

    let bucket: string
    if (daysOld <= 30) bucket = "0-30"
    else if (daysOld <= 60) bucket = "31-60"
    else if (daysOld <= 90) bucket = "61-90"
    else bucket = "90+"

    buckets[bucket].invoiceCount += 1
    buckets[bucket].totalAmount += inv.value
  }

  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    invoiceCount: data.invoiceCount,
    totalAmount: data.totalAmount,
  }))
}

// ========================
// Compute cashflow forecast from filtered invoices (12 weeks)
// ========================
export function computeCashflow(invoices: Invoice[], forecastType: "monthly" | "quarterly" = "monthly") {
  const totalValue = invoices.reduce((sum, inv) => sum + inv.value, 0)
  
  if (forecastType === "monthly") {
    // 4 weeks (1 month) view
    const confirmedPct = [0.15, 0.3, 0.45, 0.5]
    const projectedPct = [0.2, 0.4, 0.55, 0.65]

    return [
      {
        week: "Week 1",
        confirmed: Math.round(totalValue * confirmedPct[0]),
        projected: Math.round(totalValue * projectedPct[0]),
        confidenceHigh: Math.round(totalValue * projectedPct[0] * 1.15),
      },
      {
        week: "Week 2",
        confirmed: Math.round(totalValue * confirmedPct[1]),
        projected: Math.round(totalValue * projectedPct[1]),
        confidenceHigh: Math.round(totalValue * projectedPct[1] * 1.15),
      },
      {
        week: "Week 3",
        confirmed: Math.round(totalValue * confirmedPct[2]),
        projected: Math.round(totalValue * projectedPct[2]),
        confidenceHigh: Math.round(totalValue * projectedPct[2] * 1.15),
      },
      {
        week: "Week 4",
        confirmed: Math.round(totalValue * confirmedPct[3]),
        projected: Math.round(totalValue * projectedPct[3]),
        confidenceHigh: Math.round(totalValue * projectedPct[3] * 1.15),
      },
    ]
  } else {
    // 12 weeks (3 months / quarterly) view
    const confirmedPct = [0.08, 0.12, 0.15, 0.18, 0.22, 0.26, 0.3, 0.35, 0.4, 0.45, 0.48, 0.5]
    const projectedPct = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.42, 0.5, 0.55, 0.62, 0.63, 0.65]

    return [
      { week: "Week 1", confirmed: Math.round(totalValue * confirmedPct[0]), projected: Math.round(totalValue * projectedPct[0]), confidenceHigh: Math.round(totalValue * projectedPct[0] * 1.15) },
      { week: "Week 2", confirmed: Math.round(totalValue * confirmedPct[1]), projected: Math.round(totalValue * projectedPct[1]), confidenceHigh: Math.round(totalValue * projectedPct[1] * 1.15) },
      { week: "Week 3", confirmed: Math.round(totalValue * confirmedPct[2]), projected: Math.round(totalValue * projectedPct[2]), confidenceHigh: Math.round(totalValue * projectedPct[2] * 1.15) },
      { week: "Week 4", confirmed: Math.round(totalValue * confirmedPct[3]), projected: Math.round(totalValue * projectedPct[3]), confidenceHigh: Math.round(totalValue * projectedPct[3] * 1.15) },
      { week: "Week 5", confirmed: Math.round(totalValue * confirmedPct[4]), projected: Math.round(totalValue * projectedPct[4]), confidenceHigh: Math.round(totalValue * projectedPct[4] * 1.15) },
      { week: "Week 6", confirmed: Math.round(totalValue * confirmedPct[5]), projected: Math.round(totalValue * projectedPct[5]), confidenceHigh: Math.round(totalValue * projectedPct[5] * 1.15) },
      { week: "Week 7", confirmed: Math.round(totalValue * confirmedPct[6]), projected: Math.round(totalValue * projectedPct[6]), confidenceHigh: Math.round(totalValue * projectedPct[6] * 1.15) },
      { week: "Week 8", confirmed: Math.round(totalValue * confirmedPct[7]), projected: Math.round(totalValue * projectedPct[7]), confidenceHigh: Math.round(totalValue * projectedPct[7] * 1.15) },
      { week: "Week 9", confirmed: Math.round(totalValue * confirmedPct[8]), projected: Math.round(totalValue * projectedPct[8]), confidenceHigh: Math.round(totalValue * projectedPct[8] * 1.15) },
      { week: "Week 10", confirmed: Math.round(totalValue * confirmedPct[9]), projected: Math.round(totalValue * projectedPct[9]), confidenceHigh: Math.round(totalValue * projectedPct[9] * 1.15) },
      { week: "Week 11", confirmed: Math.round(totalValue * confirmedPct[10]), projected: Math.round(totalValue * projectedPct[10]), confidenceHigh: Math.round(totalValue * projectedPct[10] * 1.15) },
      { week: "Week 12", confirmed: Math.round(totalValue * confirmedPct[11]), projected: Math.round(totalValue * projectedPct[11]), confidenceHigh: Math.round(totalValue * projectedPct[11] * 1.15) },
    ]
  }
}

// ========================
// Portfolio performance data for comparison tab
// ========================
export interface PortfolioPerformance {
  owner: string
  role: string
  bu: string
  totalOutstanding: number
  overdueAmount: number
  collectionPct: number
  invoiceCount: number
  avgCreditPeriod: number
  penalInterestCount: number
}

export function computePortfolioPerformance(allInvoices: Invoice[]): PortfolioPerformance[] {
  const owners = hierarchyMappings.filter((h) => h.role !== "bu_head")
  const results: PortfolioPerformance[] = []

  for (const entry of owners) {
    const customers = getCustomersForOwners([entry.person])
    const ownerInvoices = allInvoices.filter((inv) => customers.includes(inv.customer))

    if (ownerInvoices.length === 0) continue

    const totalOutstanding = ownerInvoices.reduce((sum, inv) => sum + inv.value, 0)
    const overdueAmount = ownerInvoices
      .filter((inv) => inv.overdue)
      .reduce((sum, inv) => sum + inv.value, 0)
    const collectionTarget = ownerInvoices.reduce((sum, inv) => sum + inv.collectionTarget, 0)
    const collectionPct = collectionTarget > 0
      ? Math.round((totalOutstanding / collectionTarget) * 100)
      : 0
    const avgCreditPeriod = Math.round(
      ownerInvoices.reduce((sum, inv) => sum + inv.creditPeriod, 0) / ownerInvoices.length
    )
    const penalInterestCount = ownerInvoices.filter((inv) => inv.penalInterest).length

    results.push({
      owner: entry.person,
      role: entry.role,
      bu: entry.bu,
      totalOutstanding,
      overdueAmount,
      collectionPct,
      invoiceCount: ownerInvoices.length,
      avgCreditPeriod,
      penalInterestCount,
    })
  }

  return results
}

// ========================
// All mock invoices
// ========================
export const allInvoices: Invoice[] = [
  {
    id: "1",
    collectionAgent: "Venki",
    customer: "Acme Corp",
    invoiceNo: "INV-2025-001",
    invoiceDate: "2024-11-15",
    invoiceProcessingDate: "2024-11-18",
    value: 1500000,
    firstFollowUpScheduled: "2025-01-17",
    firstFollowUpActual: "2025-01-18",
    subsequentFollowUpActual: "2026-01-20",
    previousOutstandingInvoiceNo: "INV-2024-045",
    previousOutstandingAmount: 500000,
    collectionTarget: 5000000,
    creditPeriod: 60,
    penalInterest: true,
    overdue: true,
    reasonForOverdue: "Cash flow issues at customer end",
  },
  {
    id: "2",
    collectionAgent: "Venki",
    customer: "TechStart Inc",
    invoiceNo: "INV-2025-002",
    invoiceDate: "2024-12-01",
    invoiceProcessingDate: "2024-12-03",
    value: 850000,
    firstFollowUpScheduled: "2025-02-01",
    firstFollowUpActual: "2025-02-02",
    subsequentFollowUpActual: "2026-01-21",
    previousOutstandingInvoiceNo: "",
    previousOutstandingAmount: 0,
    collectionTarget: 4000000,
    creditPeriod: 45,
    penalInterest: true,
    overdue: true,
    reasonForOverdue: "Invoice under dispute by customer",
  },
  {
    id: "3",
    collectionAgent: "Priya",
    customer: "Enterprise Co",
    invoiceNo: "INV-2025-003",
    invoiceDate: "2024-10-10",
    invoiceProcessingDate: "2024-10-12",
    value: 3500000,
    firstFollowUpScheduled: "2024-12-12",
    firstFollowUpActual: "2024-12-12",
    subsequentFollowUpActual: "-",
    previousOutstandingInvoiceNo: "",
    previousOutstandingAmount: 0,
    collectionTarget: 6000000,
    creditPeriod: 60,
    penalInterest: false,
    overdue: false,
    reasonForOverdue: "",
  },
  {
    id: "4",
    collectionAgent: "Priya",
    customer: "Global Systems",
    invoiceNo: "INV-2025-004",
    invoiceDate: "2024-11-20",
    invoiceProcessingDate: "2024-11-22",
    value: 2200000,
    firstFollowUpScheduled: "2025-01-22",
    firstFollowUpActual: "2025-01-22",
    subsequentFollowUpActual: "2026-01-22",
    previousOutstandingInvoiceNo: "INV-2024-032",
    previousOutstandingAmount: 800000,
    collectionTarget: 5000000,
    creditPeriod: 60,
    penalInterest: false,
    overdue: true,
    reasonForOverdue: "Partial payment received, balance pending approval",
  },
  {
    id: "5",
    collectionAgent: "Venki",
    customer: "Innovation Labs",
    invoiceNo: "INV-2025-005",
    invoiceDate: "2024-10-25",
    invoiceProcessingDate: "2024-10-28",
    value: 1850000,
    firstFollowUpScheduled: "2024-12-28",
    firstFollowUpActual: "2024-12-29",
    subsequentFollowUpActual: "2026-01-25",
    previousOutstandingInvoiceNo: "INV-2024-050",
    previousOutstandingAmount: 1200000,
    collectionTarget: 4000000,
    creditPeriod: 45,
    penalInterest: true,
    overdue: true,
    reasonForOverdue: "Customer disputing service charges",
  },
  {
    id: "6",
    collectionAgent: "Priya",
    customer: "Tech Solutions",
    invoiceNo: "INV-2025-006",
    invoiceDate: "2025-01-10",
    invoiceProcessingDate: "2025-01-12",
    value: 980000,
    firstFollowUpScheduled: "2025-03-12",
    firstFollowUpActual: "-",
    subsequentFollowUpActual: "-",
    previousOutstandingInvoiceNo: "",
    previousOutstandingAmount: 0,
    collectionTarget: 6000000,
    creditPeriod: 60,
    penalInterest: false,
    overdue: false,
    reasonForOverdue: "",
  },
  {
    id: "7",
    collectionAgent: "Amit",
    customer: "DataCorp Inc",
    invoiceNo: "INV-2025-007",
    invoiceDate: "2024-09-01",
    invoiceProcessingDate: "2024-09-04",
    value: 4500000,
    firstFollowUpScheduled: "2024-11-04",
    firstFollowUpActual: "2024-11-05",
    subsequentFollowUpActual: "2026-02-01",
    previousOutstandingInvoiceNo: "INV-2024-020",
    previousOutstandingAmount: 3000000,
    collectionTarget: 8000000,
    creditPeriod: 60,
    penalInterest: true,
    overdue: true,
    reasonForOverdue: "Legal proceedings initiated",
  },
  {
    id: "8",
    collectionAgent: "Amit",
    customer: "CloudNet Services",
    invoiceNo: "INV-2025-008",
    invoiceDate: "2024-11-01",
    invoiceProcessingDate: "2024-11-04",
    value: 1250000,
    firstFollowUpScheduled: "2025-01-04",
    firstFollowUpActual: "2025-01-05",
    subsequentFollowUpActual: "2026-01-30",
    previousOutstandingInvoiceNo: "",
    previousOutstandingAmount: 0,
    collectionTarget: 3500000,
    creditPeriod: 45,
    penalInterest: true,
    overdue: true,
    reasonForOverdue: "Payment held up due to internal approval delays",
  },
]

// ========================
// Other mock data (reminders, calls, queries)
// ========================
export const reminderRules = [
  { id: "1", name: "First Reminder", daysBefore: 7, template: "friendly_reminder", enabled: true },
  { id: "2", name: "Due Date Reminder", daysBefore: 0, template: "due_today", enabled: true },
  { id: "3", name: "Overdue Notice", daysBefore: -7, template: "overdue_notice", enabled: true },
  { id: "4", name: "Final Warning", daysBefore: -30, template: "final_warning", enabled: false },
]

export const sentReminders = [
  { id: "1", invoiceNo: "INV-2025-001", customer: "Acme Corp", sentDate: "2026-01-10", status: "opened" as const, type: "Overdue Notice" },
  { id: "2", invoiceNo: "INV-2025-002", customer: "TechStart Inc", sentDate: "2026-01-12", status: "sent" as const, type: "Due Date Reminder" },
  { id: "3", invoiceNo: "INV-2025-004", customer: "Global Systems", sentDate: "2026-01-08", status: "clicked" as const, type: "Payment Plan" },
  { id: "4", invoiceNo: "INV-2025-006", customer: "Tech Solutions", sentDate: "2026-01-15", status: "bounced" as const, type: "First Reminder" },
]

export const calls = [
  { id: "1", customer: "Acme Corp", invoiceNo: "INV-2025-001", callDate: "2026-01-18", duration: "8:45", status: "completed" as const },
  { id: "2", customer: "Global Systems", invoiceNo: "INV-2025-004", callDate: "2026-01-17", duration: "12:30", status: "completed" as const },
  { id: "3", customer: "TechStart Inc", invoiceNo: "INV-2025-002", callDate: "2026-01-16", duration: "0:00", status: "missed" as const },
  { id: "4", customer: "Innovation Labs", invoiceNo: "INV-2025-005", callDate: "2026-01-20", duration: "0:00", status: "scheduled" as const },
]

export const sampleTranscription = `Agent: Good morning, this is Sarah from Accounts Receivable calling about invoice INV-2025-001.

Customer: Hi Sarah, yes I was expecting your call.

Agent: I wanted to follow up on the outstanding balance of $15,000. We haven't received payment yet and it's now 30 days overdue.

Customer: I understand. We've been having some cash flow challenges this month, but I can commit to making a payment.

Agent: That's great to hear. What amount can you commit to and by when?

Customer: I can pay $10,000 by January 25th, and the remaining $5,000 by February 10th.

Agent: Perfect, I'll note that down. So $10,000 by January 25th and $5,000 by February 10th. Is that correct?

Customer: Yes, that's correct.

Agent: Thank you for your commitment. I'll send you a confirmation email with these details.`

export const sampleAIExtraction = {
  promisedAmount: 10000,
  promisedDate: "2026-01-25",
  confidenceScore: 0.92,
  summary: "Customer acknowledged the overdue invoice and committed to a two-part payment plan. They cited temporary cash flow challenges but were cooperative throughout the call.",
  nextSteps: [
    "Record payment commitment of $10,000 by Jan 25",
    "Schedule follow-up for second payment of $5,000 by Feb 10",
    "Send confirmation email with payment plan details",
    "Update invoice status to 'Payment Plan'",
  ],
}

export const queries = [
  { id: "1", queryNo: "QRY-001", invoiceNo: "INV-2025-005", customer: "Innovation Labs", type: "dispute" as const, status: "open" as const, createdDate: "2026-01-10", description: "Customer disputes the service charges", assignee: "Venki" },
  { id: "2", queryNo: "QRY-002", invoiceNo: "INV-2025-004", customer: "Global Systems", type: "payment_plan" as const, status: "pending" as const, createdDate: "2026-01-12", description: "Request for extended payment terms", assignee: "Priya" },
  { id: "3", queryNo: "QRY-003", invoiceNo: "INV-2025-002", customer: "TechStart Inc", type: "clarification" as const, status: "resolved" as const, createdDate: "2026-01-08", description: "Question about line item details", assignee: "Venki" },
  { id: "4", queryNo: "QRY-004", invoiceNo: "INV-2025-007", customer: "DataCorp Inc", type: "dispute" as const, status: "escalated" as const, createdDate: "2025-12-15", description: "Formal dispute of entire invoice", assignee: "Amit" },
]
