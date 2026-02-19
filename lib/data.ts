import type { Invoice } from "@/components/dashboard/invoices-table"

// ========================
// Mock Data - For development/fallback
// ========================
export const allInvoices: Invoice[] = [
  {
    id: "1",
    customer: "Acme Corp",
    customerAccount: "ACC-001",
    customerGroup: "Large Enterprise",
    voucher: "INV-2025-001",
    invoice: "INV-2025-001",
    invoiceDate: "2024-11-15",
    dueDate: "2024-12-15",
    currency: "USD",
    value: 15000000,
    balance: 15000000,
    documentCurrency: "USD",
    overdue: true,
    previousOutstandingAmount: 500000,
    collectionTarget: 5000000,
    creditPeriod: 60,
    penalInterest: true,
    businessUnit: "RMD",
    costCenter: "CC-001",
    project: "P-001",
    vendor: "V-001",
    worker: "W-001",
    onsiteOffshore: "Onsite",
    revisedOverdueBucket: "90+",
    geo: "NA",
    company: "Acme Inc",
    firstFollowUpScheduled: "2025-01-17",
    firstFollowUpActual: "2025-01-18",
    subsequentFollowUpActual: "2026-01-20",
    reasonForOverdue: "Cash flow issues",
  },
  {
    id: "2",
    customer: "TechStart Inc",
    customerAccount: "ACC-002",
    customerGroup: "Mid-Market",
    voucher: "INV-2025-002",
    invoice: "INV-2025-002",
    invoiceDate: "2024-12-01",
    dueDate: "2025-01-01",
    currency: "USD",
    value: 8500000,
    balance: 8500000,
    documentCurrency: "USD",
    overdue: true,
    previousOutstandingAmount: 0,
    collectionTarget: 3000000,
    creditPeriod: 45,
    penalInterest: true,
    businessUnit: "CSD",
    costCenter: "CC-002",
    project: "P-002",
    vendor: "V-002",
    worker: "W-002",
    onsiteOffshore: "Offshore",
    revisedOverdueBucket: "61-90",
    geo: "APAC",
    company: "TechStart Ltd",
    firstFollowUpScheduled: "2025-02-01",
    firstFollowUpActual: "2025-02-02",
    subsequentFollowUpActual: "2026-01-21",
    reasonForOverdue: "Invoice disputed",
  },
]

export const reminderRules = [
  { id: "1", name: "Escalation Rule 1", condition: "overdue > 30 days", action: "Email Manager" },
  { id: "2", name: "Escalation Rule 2", condition: "overdue > 60 days", action: "Notify Director" },
]

export const sentReminders = [
  { id: "1", invoiceId: "INV-2025-001", type: "email", recipient: "customer@acme.com", sentDate: "2024-12-20" },
  { id: "2", invoiceId: "INV-2025-002", type: "phone", recipient: "John Doe", sentDate: "2024-12-21" },
]

export const calls = [
  { id: "1", invoiceId: "INV-2025-001", duration: 15, date: "2024-12-20", notes: "Customer confirmed payment" },
  { id: "2", invoiceId: "INV-2025-002", duration: 10, date: "2024-12-21", notes: "Left voicemail" },
]

export const sampleTranscription = "Customer confirmed they will pay by end of month."
export const sampleAIExtraction = { amount: "$8,500,000", dueDate: "2025-01-01" }

export const queries = [
  { id: "1", subject: "Payment Plan Request", customer: "Acme Corp", status: "pending" },
  { id: "2", subject: "Invoice Dispute", customer: "TechStart Inc", status: "resolved" },
]

// ========================
// Hierarchy and Roles
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
// Utility Functions
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

export function getCustomersForOwners(selectedOwners: string[]): string[] {
  if (selectedOwners.length === 0) return allInvoices.map((i) => i.customer)
  const uniqueCustomers = new Set<string>()
  for (const owner of selectedOwners) {
    allInvoices
      .filter((inv) => inv.worker === owner || inv.vendor === owner)
      .forEach((inv) => uniqueCustomers.add(inv.customer))
  }
  return Array.from(uniqueCustomers)
}

// ========================
// Compute KPIs
// ========================
export function computeKPIs(invoices: Invoice[]) {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.value || 0), 0)
  const overdueInvoices = invoices.filter((inv) => inv.overdue)
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.value || 0), 0)
  const nonOverdue = invoices.filter((inv) => !inv.overdue)
  const partiallyPaid = nonOverdue.reduce((sum, inv) => sum + (inv.previousOutstandingAmount || 0), 0)
  const collectionTarget = invoices.reduce((sum, inv) => sum + (inv.collectionTarget || 0), 0)
  const avgCreditPeriod = invoices.length > 0
    ? Math.round(invoices.reduce((sum, inv) => sum + (inv.creditPeriod || 0), 0) / invoices.length)
    : 0

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
// Compute Aging Buckets
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
    buckets[bucket].totalAmount += inv.value || 0
  }

  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    invoiceCount: data.invoiceCount,
    totalAmount: data.totalAmount,
  }))
}

// ========================
// Compute Cashflow Forecast
// ========================
export function computeCashflow(invoices: Invoice[], forecastType: "monthly" | "quarterly" = "monthly") {
  const totalValue = invoices.reduce((sum, inv) => sum + (inv.value || 0), 0)

  if (forecastType === "monthly") {
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
    const confirmedPct = [0.08, 0.12, 0.15, 0.18, 0.22, 0.26, 0.3, 0.35, 0.4, 0.45, 0.48, 0.5]
    const projectedPct = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.42, 0.5, 0.55, 0.62, 0.63, 0.65]

    return confirmedPct.map((pct, i) => ({
      week: `Week ${i + 1}`,
      confirmed: Math.round(totalValue * pct),
      projected: Math.round(totalValue * projectedPct[i]),
      confidenceHigh: Math.round(totalValue * projectedPct[i] * 1.15),
    }))
  }
}

// ========================
// Portfolio Performance
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

export function computePortfolioPerformance(invoices: Invoice[]): PortfolioPerformance[] {
  const owners = hierarchyMappings.filter((h) => h.role !== "bu_head")
  const results: PortfolioPerformance[] = []

  for (const entry of owners) {
    const ownerInvoices = invoices.filter((inv) => inv.worker === entry.person || inv.vendor === entry.person)

    if (ownerInvoices.length === 0) continue

    const totalOutstanding = ownerInvoices.reduce((sum, inv) => sum + (inv.value || 0), 0)
    const overdueAmount = ownerInvoices
      .filter((inv) => inv.overdue)
      .reduce((sum, inv) => sum + (inv.value || 0), 0)
    const collectionTarget = ownerInvoices.reduce((sum, inv) => sum + (inv.collectionTarget || 0), 0)
    const collectionPct = collectionTarget > 0 ? Math.round((totalOutstanding / collectionTarget) * 100) : 0
    const avgCreditPeriod = Math.round(
      ownerInvoices.reduce((sum, inv) => sum + (inv.creditPeriod || 0), 0) / ownerInvoices.length
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
// FX Rates
// ========================
export const FX_RATES: Record<string, number> = {
  "USD:INR": 83,
  "INR:USD": 1 / 83,
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  const key = `${fromCurrency}:${toCurrency}`
  const rate = FX_RATES[key]
  if (!rate) return amount
  return Math.round(amount * rate)
}

// ========================
// Filter Functions
// ========================
export function filterInvoicesByOwners(invoices: Invoice[], selectedOwners: string[]): Invoice[] {
  if (selectedOwners.length === 0) return invoices
  return invoices.filter((inv) => selectedOwners.includes(inv.worker || ""))
}

export function filterInvoicesByBU(invoices: Invoice[], bu: string): Invoice[] {
  if (bu === "all") return invoices
  return invoices.filter((inv) => inv.businessUnit === bu)
}

export function enrichInvoicesWithDocumentCurrency(invoices: Invoice[]): Invoice[] {
  return invoices.map((invoice) => ({
    ...invoice,
    documentCurrency: invoice.documentCurrency || "USD",
  }))
}
