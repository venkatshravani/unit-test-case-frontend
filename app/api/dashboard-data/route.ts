/**
 * API endpoint to fetch invoice data from FastAPI backend
 * The backend queries the Dataverse cr16e_customeraccounttransaction table
 */

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const businessUnit = searchParams.get("business_unit") || "all"
    const entity = searchParams.get("entity") || "all"
    const currency = searchParams.get("currency") || "USD"
    const customers = searchParams.get("customers") // Comma-separated list of customer accounts

    // Return metadata (BUs, Entities, etc.)
    if (action === "metadata") {
      console.log("[v0] Fetching metadata from backend...")
      const response = await fetch(
        `${BACKEND_URL}/api/dashboard-data?action=metadata`,
        { cache: "no-store" }
      )

      if (!response.ok) {
        console.error("[v0] Backend metadata error:", response.status)
        throw new Error(`Backend error: ${response.status}`)
      }

      const metadata = await response.json()

      return NextResponse.json({
        businessUnits: metadata.business_units || [],
        entities: metadata.entities || [],
        currencies: ["USD", "INR"],
      })
    }

    // Fetch and return invoice data from backend
    console.log(
      `[v0] Fetching invoices: BU=${businessUnit}, Entity=${entity}, Currency=${currency}, Customers=${customers}`
    )

    const backendUrl = new URL(`${BACKEND_URL}/api/dashboard-data`)
    backendUrl.searchParams.append("business_unit", businessUnit)
    backendUrl.searchParams.append("entity", entity)
    backendUrl.searchParams.append("currency", currency)
    
    // Pass assigned customers to backend for filtering
    if (customers) {
      backendUrl.searchParams.append("customers", customers)
    }

    const response = await fetch(backendUrl.toString(), {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Backend error:", response.status)
      throw new Error(`Backend error: ${response.status}`)
    }

    const backendData = await response.json()

    // Transform backend response to match frontend expectations
    const transformedData = {
      success: true,
      data: backendData.invoices || [],
      count: backendData.invoices?.length || 0,
      summary: backendData.summary,
      currency,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
      },
      { status: 500 }
    )
  }
}
