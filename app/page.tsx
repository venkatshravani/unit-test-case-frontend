"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlobalFilters, type FilterState } from "@/components/dashboard/global-filters"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { AgingBucketsChart } from "@/components/dashboard/aging-buckets-chart"
import { CashflowForecastChart } from "@/components/dashboard/cashflow-forecast-chart"
import { InvoicesTable, type Invoice } from "@/components/dashboard/invoices-table"
import { RemindersTab } from "@/components/dashboard/reminders-tab"
import { CallsTab } from "@/components/dashboard/calls-tab"
import { QueriesTab } from "@/components/dashboard/queries-tab"
import { ReportsTab } from "@/components/dashboard/reports-tab"
import { PortfolioPerformanceTab } from "@/components/dashboard/portfolio-performance-tab"
import { AICollectionInsights } from "@/components/dashboard/ai-collection-insights"
import { DataStatusBanner } from "@/components/dashboard/data-status-banner"
import {
  FileTextIcon,
  BellIcon,
  PhoneIcon,
  MessageSquareIcon,
  BarChart3Icon,
  BriefcaseIcon,
} from "lucide-react"
import {
  allInvoices,
  reminderRules,
  sentReminders,
  calls,
  sampleTranscription,
  sampleAIExtraction,
  queries,
  filterInvoicesByOwners,
  filterInvoicesByBU,
  computeKPIs,
  computeAgingBuckets,
  computeCashflow,
  computePortfolioPerformance,
} from "@/lib/data"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [selectedReminder, setSelectedReminder] = useState<typeof sentReminders[0] | undefined>()
  const [selectedCall, setSelectedCall] = useState<typeof calls[0] | undefined>()
  const [invoiceData, setInvoiceData] = useState<Invoice[]>(allInvoices)

  // Filter state lifted from GlobalFilters
  const [filters, setFilters] = useState<FilterState>({
    businessUnit: "all",
    entity: "all",
    customer: "all",
    currency: "INR",
    role: "all",
    selectedOwners: [],
    dateRange: undefined,
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Compute filtered invoices based on current filters
  const filteredInvoices = useMemo(() => {
    let result = invoiceData

    // Filter by BU
    result = filterInvoicesByBU(result, filters.businessUnit)

    // Filter by selected portfolio owners
    result = filterInvoicesByOwners(result, filters.selectedOwners)

    // Filter by customer
    if (filters.customer !== "all") {
      result = result.filter(
        (inv) => inv.customer.toLowerCase().replace(/\s+/g, "") === filters.customer.toLowerCase().replace(/\s+/g, "")
      )
    }

    return result
  }, [invoiceData, filters.businessUnit, filters.selectedOwners, filters.customer])

  // Dynamically recompute KPIs, aging, cashflow from filtered data
  const kpiData = useMemo(() => computeKPIs(filteredInvoices), [filteredInvoices])
  const agingData = useMemo(() => computeAgingBuckets(filteredInvoices), [filteredInvoices])
  const cashflowData = useMemo(() => computeCashflow(filteredInvoices), [filteredInvoices])
  const portfolioData = useMemo(() => computePortfolioPerformance(invoiceData), [invoiceData])

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })

  const handleUpdateInvoice = (
    invoiceId: string,
    updates: { firstFollowUpActual: string; subsequentFollowUpActual: string; notes?: string }
  ) => {
    setInvoiceData((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              firstFollowUpActual: updates.firstFollowUpActual,
              subsequentFollowUpActual: updates.subsequentFollowUpActual,
            }
          : inv
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoice Collection Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage invoices, track payments, and coordinate collection efforts
              </p>
            </div>
            <div className="text-sm text-muted-foreground">Data Last Refreshed: {currentDate}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Data Status Banner */}
        <DataStatusBanner />

        {/* Global Filters */}
        <GlobalFilters onFilterChange={handleFilterChange} />

        {/* Active View Context Label */}
        <div className="text-sm text-muted-foreground px-4 py-2 bg-muted/30 rounded-md border border-muted">
          <span className="font-medium">Active View:</span>
          {filters.entity !== "all" && <span> {filters.entity} Entity</span>}
          {filters.businessUnit !== "all" && <span> | BU: {filters.businessUnit}</span>}
          {filters.selectedOwners.length > 0 && (
            <span> | Portfolio Owner: {filters.selectedOwners.join(", ")}</span>
          )}
          {filters.entity === "all" && filters.businessUnit === "all" && filters.selectedOwners.length === 0 && (
            <span> All Entities | All Business Units | All Owners</span>
          )}
        </div>

        {/* KPI Cards with Header */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground px-1">
            {filters.entity !== "all" ? `${filters.entity}` : "All Entities"} - Key Collection Metrics
          </p>
          <KPICards data={kpiData} />
        </div>

        {/* Charts Row with AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AgingBucketsChart data={agingData} />
          </div>
          <div className="lg:col-span-1">
            <CashflowForecastChart data={cashflowData} />
          </div>
          <div className="lg:col-span-1">
            <AICollectionInsights invoices={filteredInvoices} />
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card border shadow-sm h-auto p-1 flex-wrap">
            <TabsTrigger
              value="invoices"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileTextIcon className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BellIcon className="h-4 w-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger
              value="calls"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PhoneIcon className="h-4 w-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger
              value="queries"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquareIcon className="h-4 w-4" />
              Queries
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BriefcaseIcon className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3Icon className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <InvoicesTable invoices={filteredInvoices} onUpdateInvoice={handleUpdateInvoice} />
          </TabsContent>

          <TabsContent value="reminders" className="mt-4">
            <RemindersTab
              rules={reminderRules}
              sentReminders={sentReminders}
              selectedReminder={selectedReminder}
              onSelectReminder={setSelectedReminder}
            />
          </TabsContent>

          <TabsContent value="calls" className="mt-4">
            <CallsTab
              calls={calls}
              selectedCall={selectedCall}
              transcription={selectedCall?.id === "1" ? sampleTranscription : undefined}
              aiExtraction={selectedCall?.id === "1" ? sampleAIExtraction : undefined}
              onSelectCall={setSelectedCall}
            />
          </TabsContent>

          <TabsContent value="queries" className="mt-4">
            <QueriesTab queries={queries} />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <PortfolioPerformanceTab data={portfolioData} />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
