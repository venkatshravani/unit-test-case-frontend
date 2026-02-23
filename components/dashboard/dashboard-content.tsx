'use client'

import { useEffect, useState } from 'react'
import { InvoicesTable } from './invoices-table'
import { GlobalFilters } from './global-filters'
import type { Invoice } from './invoices-table'

interface DashboardContentProps {
  assignedCustomers: string[]
  userEmail?: string
}

export default function DashboardContent({ assignedCustomers, userEmail }: DashboardContentProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [bu, setBu] = useState('all')
  const [entity, setEntity] = useState('all')
  const [currency, setCurrency] = useState('USD')

  // Fetch invoices assigned to this user
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        // Always filter by assigned customers
        if (assignedCustomers.length > 0) {
          params.append('customers', assignedCustomers.join(','))
        }
        
        params.append('business_unit', bu)
        params.append('entity', entity)
        params.append('currency', currency)

        const response = await fetch(
          `/api/dashboard-data?${params.toString()}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const data = await response.json()
        setInvoices(data.data || [])
        console.log('[v0] Fetched invoices for user:', data.data?.length || 0)
      } catch (error) {
        console.error('[v0] Error fetching invoices:', error)
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
