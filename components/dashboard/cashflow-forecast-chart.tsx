"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts"
import { computeCashflow } from "@/lib/data"
import { Invoice } from "@/components/dashboard/invoices-table"

interface CashflowData {
  week: string
  confirmed: number
  projected: number
  confidenceLow?: number
  confidenceHigh?: number
}

interface CashflowForecastChartProps {
  invoices: Invoice[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const confirmed = payload.find(p => p.dataKey === "confirmed")
    const projected = payload.find(p => p.dataKey === "projected")
    
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-popover-foreground mb-2">{label}</p>
        {confirmed && (
          <p className="text-sm" style={{ color: "#f97316" }}>
            Confirmed: ${confirmed.value.toLocaleString()}
          </p>
        )}
        {projected && (
          <p className="text-sm" style={{ color: "#3b82f6" }}>
            Projected: ${projected.value.toLocaleString()}
          </p>
        )}
      </div>
    )
  }
  return null
}

export function CashflowForecastChart({ invoices }: CashflowForecastChartProps) {
  const [forecastType, setForecastType] = useState<"monthly" | "quarterly">("quarterly")
  
  // Compute full 12-week data
  const fullData = useMemo(() => computeCashflow(invoices, "quarterly"), [invoices])
  
  // Filter data based on forecast type
  const displayData = forecastType === "monthly" ? fullData.slice(0, 4) : fullData

  const chartColors = {
    confirmed: "#f97316",
    projected: "#3b82f6",
    confidence: "rgba(59, 130, 246, 0.1)",
  }

  const title = forecastType === "monthly" ? "Cashflow Forecast (4 Weeks)" : "Cashflow Forecast (12 Weeks)"

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={forecastType === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setForecastType("monthly")}
              className="text-xs h-8"
            >
              Month
            </Button>
            <Button
              variant={forecastType === "quarterly" ? "default" : "outline"}
              size="sm"
              onClick={() => setForecastType("quarterly")}
              className="text-xs h-8"
            >
              Quarter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.projected} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColors.projected} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
              <Area
                type="monotone"
                dataKey="confidenceHigh"
                stroke="none"
                fill="url(#confidenceGradient)"
                name="Confidence Range"
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                name="Confirmed (Agreed)"
                stroke={chartColors.confirmed}
                strokeWidth={2}
                dot={{ fill: chartColors.confirmed, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected Inflow"
                stroke={chartColors.projected}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: chartColors.projected, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

  const chartColors = {
    confirmed: "#f97316",
    projected: "#3b82f6",
    confidence: "rgba(59, 130, 246, 0.1)",
  }

  const title = forecastType === "monthly" ? "Cashflow Forecast (4 Weeks)" : "Cashflow Forecast (12 Weeks)"

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={forecastType === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setForecastType("monthly")}
              className="text-xs h-8"
            >
              Month
            </Button>
            <Button
              variant={forecastType === "quarterly" ? "default" : "outline"}
              size="sm"
              onClick={() => setForecastType("quarterly")}
              className="text-xs h-8"
            >
              Quarter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.projected} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColors.projected} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
              <Area
                type="monotone"
                dataKey="confidenceHigh"
                stroke="none"
                fill="url(#confidenceGradient)"
                name="Confidence Range"
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                name="Confirmed (Agreed)"
                stroke={chartColors.confirmed}
                strokeWidth={2}
                dot={{ fill: chartColors.confirmed, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected Inflow"
                stroke={chartColors.projected}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: chartColors.projected, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
