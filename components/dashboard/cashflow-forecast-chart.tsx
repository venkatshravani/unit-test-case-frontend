"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface CashflowData {
  week: string
  confirmed: number
  projected: number
  confidenceLow?: number
  confidenceHigh?: number
}

interface CashflowForecastChartProps {
  data: CashflowData[]
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

export function CashflowForecastChart({ data }: CashflowForecastChartProps) {
  const chartColors = {
    confirmed: "#f97316",
    projected: "#3b82f6",
    confidence: "rgba(59, 130, 246, 0.1)",
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Cashflow Forecast (12 Weeks)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
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
