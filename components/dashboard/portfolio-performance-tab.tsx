"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { PortfolioPerformance } from "@/lib/data"

interface PortfolioPerformanceTabProps {
  data: PortfolioPerformance[]
}

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#eab308", "#14b8a6"]

const roleLabels: Record<string, string> = {
  finance_agent: "Finance Agent",
  delivery_manager: "Delivery Manager",
  project_manager: "Project Manager",
  bu_head: "BU Head",
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: { owner: string; collectionPct: number } }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-popover-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Collection %: {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

export function PortfolioPerformanceTab({ data }: PortfolioPerformanceTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const chartData = data.map((d) => ({
    owner: d.owner,
    collectionPct: d.collectionPct,
  }))

  return (
    <div className="space-y-6">
      {/* Collection % Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Collection % by Portfolio Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="owner"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="collectionPct" name="Collection %" radius={[4, 4, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Portfolio Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold whitespace-nowrap">Owner</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Role</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">BU</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Total Outstanding</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Overdue Amount</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Collection %</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Invoices</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Avg Credit Period</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Penal Interest Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={`${row.owner}-${row.role}`} className="hover:bg-muted/30">
                    <TableCell className="font-medium whitespace-nowrap">{row.owner}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {roleLabels[row.role] || row.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">
                        {row.bu}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatCurrency(row.totalOutstanding)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className={row.overdueAmount > 0 ? "text-destructive font-medium" : ""}>
                        {formatCurrency(row.overdueAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={
                          row.collectionPct >= 50
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : row.collectionPct >= 30
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {row.collectionPct}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{row.invoiceCount}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {row.avgCreditPeriod} days
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {row.penalInterestCount}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No portfolio data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
