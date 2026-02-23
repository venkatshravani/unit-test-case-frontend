'use client'

import { useEffect, useState } from 'react'
import { InvoicesTable } from './invoices-table'
import { GlobalFilters } from './global-filters'
import { KPICards } from './kpi-cards'
import { AgingBucketsChart } from './aging-buckets-chart'
import { CashflowForecastChart } from './cashflow-forecast-chart'
import type { Invoice } from './invoices-table'
import { allInvoices, computeKPIs, computeAgingBuckets } from '@/lib/data'

interface DashboardContentProps {
  assignedCustomers: string[]
  userEmail?: string
}

export default function DashboardContent({ assignedCustomers, userEmail }: DashboardContentProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [bu, setBu] = useState('all')
  const [entity, setEntity] = useState('all')
  const [currency, setCurrency] = useState('USD')

  // Initialize with mock data while backend is being set up
  useEffect(() => {
    try {
      setLoading(true)
      
      // Use mock data from lib/data.ts
      let data = allInvoices
      
      // Filter by assigned customers if provided
      if (assignedCustomers.length > 0) {
        data = data.filter((inv) =>
          assignedCustomers.includes(inv.voucher || inv.invoice || '')
        )
      }
      
      setInvoices(data)
      setFilteredInvoices(data)
      console.log('[v0] Loaded dashboard with', data.length, 'invoices')
    } catch (error) {
      console.error('[v0] Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [assignedCustomers])

  const handleFilterChange = (filters: any) => {
    setBu(filters.businessUnit)
    setEntity(filters.entity)
    setCurrency(filters.currency)
    
    // Apply filters to invoices
    let filtered = invoices
    
    if (filters.businessUnit !== 'all') {
      filtered = filtered.filter((inv) => inv.businessUnit === filters.businessUnit)
    }
    
    setFilteredInvoices(filtered)
  }

  const kpiData = computeKPIs(filteredInvoices)
  const agingData = computeAgingBuckets(filteredInvoices)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Invoice Collection Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {userEmail ? `Logged in as: ${userEmail}` : 'Manage invoices and track payments'}
        </p>
      </div>

      <GlobalFilters onFilterChange={handleFilterChange} />

      <KPICards data={kpiData} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgingBucketsChart data={agingData} />
        <CashflowForecastChart invoices={filteredInvoices} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Invoices</h2>
        <InvoicesTable invoices={filteredInvoices} />
      </div>
    </div>
  )
}
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    if (assignedCustomers.length > 0) {
      fetchInvoices()
    }
  }, [assignedCustomers, bu, entity, currency])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Collection Dashboard</h1>
          <p className="text-muted-foreground">
            Manage invoices, track payments, and coordinate collection efforts
          </p>
          {assignedCustomers.length > 0 && (
            <p className="text-sm text-primary mt-2">
              Showing {assignedCustomers.length} assigned customer(s)
            </p>
          )}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          Data Last Refreshed: {new Date().toLocaleDateString()}
        </div>
      </div>

      <GlobalFilters
        businessUnit={bu}
        onBusinessUnitChange={setBu}
        entity={entity}
        onEntityChange={setEntity}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <InvoicesTable invoices={invoices} loading={loading} />
    </div>
  )
}
