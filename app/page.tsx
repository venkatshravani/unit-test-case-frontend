"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // No user, redirect to login
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[v0] Auth check error:", err)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [supabase, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
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
          <KPICards data={kpiData} currency={filters.currency} />
        </div>

        {/* Charts Row with AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AgingBucketsChart data={agingData} />
          </div>
          <div className="lg:col-span-1">
            <CashflowForecastChart invoices={filteredInvoices} />
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
            {!showDetailedInvoices ? (
              <CustomerAgingSummary 
                invoices={filteredInvoices} 
                currency={filters.currency}
                onCustomerSelect={(customer) => {
                  setSelectedCustomer(customer)
                  setShowDetailedInvoices(true)
                }}
              />
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowDetailedInvoices(false)
                    setSelectedCustomer(null)
                  }}
                  className="text-sm text-primary hover:underline mb-4"
                >
                  ← Back to Customer Summary
                </button>
                {selectedCustomer && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Viewing invoices for: <span className="text-primary">{selectedCustomer}</span></p>
                  </div>
                )}
                <InvoicesTable invoices={detailInvoices} onUpdateInvoice={handleUpdateInvoice} hideCollectionAgent={true} />
              </div>
            )}
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
