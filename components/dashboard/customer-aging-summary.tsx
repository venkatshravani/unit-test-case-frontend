"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Invoice } from "@/components/dashboard/invoices-table"
import { ChevronRightIcon } from "lucide-react"

interface CustomerAgingSummary {
  customer: string
  totalAmount: number
  aging_1_4: number
  aging_5_15: number
  aging_16_30: number
  aging_31_60: number
  aging_61_90: number
  aging_90plus: number
  invoiceCount: number
  documentCurrency?: string
}

interface CustomerAgingSummaryProps {
  invoices: Invoice[]
  currency?: string
  onCustomerSelect?: (customer: string, invoices: Invoice[]) => void
}

export function CustomerAgingSummary({
  invoices,
  currency = "USD",
  onCustomerSelect,
}: CustomerAgingSummaryProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)

  // Aggregate invoices by customer and aging bucket
  const customerSummaries = invoices.reduce((acc, invoice) => {
    const existing = acc.find((s) => s.customer === invoice.customer)
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(invoice.invoiceDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (existing) {
      existing.totalAmount += invoice.value
      existing.invoiceCount += 1
      existing.documentCurrency = invoice.documentCurrency

      if (daysOverdue <= 4) existing.aging_1_4 += invoice.value
      else if (daysOverdue <= 15) existing.aging_5_15 += invoice.value
      else if (daysOverdue <= 30) existing.aging_16_30 += invoice.value
      else if (daysOverdue <= 60) existing.aging_31_60 += invoice.value
      else if (daysOverdue <= 90) existing.aging_61_90 += invoice.value
      else existing.aging_90plus += invoice.value
    } else {
      const summary: CustomerAgingSummary = {
        customer: invoice.customer,
        totalAmount: invoice.value,
        aging_1_4: 0,
        aging_5_15: 0,
        aging_16_30: 0,
        aging_31_60: 0,
        aging_61_90: 0,
        aging_90plus: 0,
        invoiceCount: 1,
        documentCurrency: invoice.documentCurrency,
      }

      if (daysOverdue <= 4) summary.aging_1_4 = invoice.value
      else if (daysOverdue <= 15) summary.aging_5_15 = invoice.value
      else if (daysOverdue <= 30) summary.aging_16_30 = invoice.value
      else if (daysOverdue <= 60) summary.aging_31_60 = invoice.value
      else if (daysOverdue <= 90) summary.aging_61_90 = invoice.value
      else summary.aging_90plus = invoice.value

      acc.push(summary)
    }

    return acc
  }, [] as CustomerAgingSummary[])

  const customerInvoices = selectedCustomer
    ? invoices.filter((inv) => inv.customer === selectedCustomer)
    : []

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Customer Outstanding by Aging Bucket
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {customerSummaries.length} customers | {invoices.length} invoices
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="h-10">Customer Name</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">1-4 Days</TableHead>
                  <TableHead className="text-center">5-15 Days</TableHead>
                  <TableHead className="text-center">16-30 Days</TableHead>
                  <TableHead className="text-center">31-60 Days</TableHead>
                  <TableHead className="text-center">61-90 Days</TableHead>
                  <TableHead className="text-center">90+ Days</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerSummaries.map((summary) => (
                  <TableRow
                    key={summary.customer}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(summary.customer)
                      const customerInvoices = invoices.filter(
                        (inv) => inv.customer === summary.customer
                      )
                      onCustomerSelect?.(summary.customer, customerInvoices)
                    }}
                  >
                    <TableCell className="font-medium">{summary.customer}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(summary.totalAmount, currency)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {summary.aging_1_4 > 0
                        ? formatCurrency(summary.aging_1_4, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {summary.aging_5_15 > 0
                        ? formatCurrency(summary.aging_5_15, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {summary.aging_16_30 > 0
                        ? formatCurrency(summary.aging_16_30, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {summary.aging_31_60 > 0
                        ? formatCurrency(summary.aging_31_60, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {summary.aging_61_90 > 0
                        ? formatCurrency(summary.aging_61_90, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-destructive">
                      {summary.aging_90plus > 0
                        ? formatCurrency(summary.aging_90plus, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">{summary.invoiceCount}</TableCell>
                    <TableCell className="text-center">
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={selectedCustomer !== null}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer} - Invoice Details ({customerInvoices.length} invoices)
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Days Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerInvoices.map((invoice) => {
                  const daysOutstanding = Math.floor(
                    (new Date().getTime() - new Date(invoice.invoiceDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoiceNo}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.value, invoice.documentCurrency)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <span
                          className={
                            daysOutstanding > 90
                              ? "text-destructive font-semibold"
                              : daysOutstanding > 30
                                ? "text-orange-600 font-medium"
                                : "text-green-600"
                          }
                        >
                          {daysOutstanding} days
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
