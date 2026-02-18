"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KPICardProps {
  title: string
  value: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  tooltip: string
}

function KPICard({ title, value, trend, trendValue, tooltip }: KPICardProps) {
  return (
    <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center gap-0.5 text-sm font-medium ${
                trend === "up"
                  ? "text-status-overdue"
                  : trend === "down"
                    ? "text-status-paid"
                    : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : trend === "down" ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface KPICardsProps {
  data: {
    totalOutstanding: number
    overdueAmount: number
    partiallyPaid: number
    committedPayments: number
    dso: number
    avgDaysToPay: number
  }
}

export function KPICards({ data }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const kpis: KPICardProps[] = [
    {
      title: "Total Outstanding",
      value: formatCurrency(data.totalOutstanding),
      trend: "up",
      trendValue: "+5.2%",
      tooltip: "Sum of all unpaid invoice amounts across all customers",
    },
    {
      title: "Overdue Amount",
      value: formatCurrency(data.overdueAmount),
      trend: "up",
      trendValue: "+12.3%",
      tooltip: "Total amount past due date, requires immediate attention",
    },
    {
      title: "Partially Paid",
      value: formatCurrency(data.partiallyPaid),
      trend: "neutral",
      trendValue: "0%",
      tooltip: "Invoices with partial payments received",
    },
    {
      title: "Committed Payments",
      value: formatCurrency(data.committedPayments),
      trend: "down",
      trendValue: "-8.1%",
      tooltip: "Payments promised by customers with confirmed dates",
    },
    {
      title: "DSO (Weighted Avg)",
      value: `${data.dso} days`,
      trend: "up",
      trendValue: "+3 days",
      tooltip: "Days Sales Outstanding - average collection period weighted by invoice amount",
    },
    {
      title: "Avg Days to Pay",
      value: `${data.avgDaysToPay} days`,
      trend: "down",
      trendValue: "-2 days",
      tooltip: "Average number of days from invoice date to payment receipt",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
