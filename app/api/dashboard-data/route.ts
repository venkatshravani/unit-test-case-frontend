/**
 * API endpoint to fetch invoice data from Power Apps Base Data table
 * This endpoint aggregates and filters invoice data based on query parameters
 */

import { NextRequest, NextResponse } from "next/server"

// Mock data structure matching Power Apps Base Data table
// In production, this would fetch from actual Power Apps API
const mockBaseData = [
  {
    id: "INV-2025-001",
    customerAccount: "ACC-001",
    customerName: "Acme Corp",
    customerGroup: "Large Enterprise",
    voucher: "INV-2025-001",
    invoiceDate: "2024-11-15",
    dueDate: "2024-12-15",
    currency: "USD",
    amountInTransaction: 15000000,
    balance: 15000000,
    accountingCurrencyBalance: 15000000,
    reportingCurrencyBalance: 15000000,
    description: "Consulting Services",
    project: "$50,000",
    businessUnit: "RMD",
    costCenter: "CC-001",
    vendor: "External Vendor",
    worker: "John Doe",
    onsiteOffshore: "Onsite",
    revisedOverdueBucket: "90+",
    geo: "NA",
    company: "Acme Inc",
    customerReferenceSoFo: "REF-001",
    asapla: "ASAPLA-001",
    closedDate: null,
    agingBucket: "90+",
    daysOverdue: 65,
  },
  {
    id: "INV-2025-002",
    customerAccount: "ACC-002",
    customerName: "TechStart Inc",
    customerGroup: "Mid-Market",
    voucher: "INV-2025-002",
    invoiceDate: "2024-12-01",
    dueDate: "2025-01-01",
    currency: "USD",
    amountInTransaction: 8500000,
    balance: 8500000,
    accountingCurrencyBalance: 8500000,
    reportingCurrencyBalance: 8500000,
    description: "Software Licenses",
    project: "$40,000",
    businessUnit: "CSD",
    costCenter: "CC-002",
    vendor: "Tech Vendor",
    worker: "Jane Smith",
    onsiteOffshore: "Offshore",
    revisedOverdueBucket: "61-90",
    geo: "APAC",
    company: "TechStart Ltd",
    customerReferenceSoFo: "REF-002",
    asapla: "ASAPLA-002",
    closedDate: null,
    agingBucket: "61-90",
    daysOverdue: 48,
  },
  {
    id: "INV-2025-003",
    customerAccount: "ACC-003",
    customerName: "Enterprise Co",
    customerGroup: "Large Enterprise",
    voucher: "INV-2025-003",
    invoiceDate: "2025-01-01",
    dueDate: "2025-02-01",
    currency: "INR",
    amountInTransaction: 35000000,
    balance: 35000000,
    accountingCurrencyBalance: 35000000,
    reportingCurrencyBalance: 35000000,
    description: "Maintenance Support",
    project: "$75,000",
    businessUnit: "EAS",
    costCenter: "CC-003",
    vendor: "Support Vendor",
    worker: "Mike Johnson",
    onsiteOffshore: "Onsite",
    revisedOverdueBucket: "31-60",
    geo: "EU",
    company: "Enterprise Global",
    customerReferenceSoFo: "REF-003",
    asapla: "ASAPLA-003",
    closedDate: null,
    agingBucket: "31-60",
    daysOverdue: 17,
  },
]

// Extract unique values from data
function extractUniqueValues(data: typeof mockBaseData, field: string): string[] {
  const values = new Set<string>()
  data.forEach((item) => {
    const value = (item as Record<string, any>)[field]
    if (value) values.add(value)
  })
  return Array.from(values).sort()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const bu = searchParams.get("bu")
    const entity = searchParams.get("entity")
    const currency = searchParams.get("currency")

    // Return metadata (BUs, Entities)
    if (action === "metadata") {
      return NextResponse.json({
        businessUnits: [
          { value: "all", label: "All BUs" },
          ...extractUniqueValues(mockBaseData, "businessUnit").map((bu) => ({
            value: bu,
            label: bu,
          })),
        ],
        entities: [
          { value: "all", label: "All Entities" },
          ...extractUniqueValues(mockBaseData, "company").map((entity) => ({
            value: entity,
            label: entity,
          })),
        ],
        currencies: ["USD", "INR"],
      })
    }

    // Filter and return invoice data
    let filteredData = mockBaseData

    if (bu && bu !== "all") {
      filteredData = filteredData.filter((item) => item.businessUnit === bu)
    }

    if (entity && entity !== "all") {
      filteredData = filteredData.filter((item) => item.company === entity)
    }

    if (currency && currency !== "all") {
      filteredData = filteredData.filter((item) => item.currency === currency)
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
