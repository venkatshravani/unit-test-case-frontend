"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useState } from "react"

interface AgingBucket {
  bucket: string
  invoiceCount: number
  totalAmount: number
}

interface AgingBucketsChartProps {
  data: AgingBucket[]
  onBucketClick?: (bucket: string) => void
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-popover-foreground mb-2">{label} Days</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === "Total Amount" 
              ? `$${entry.value.toLocaleString()}` 
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AgingBucketsChart({ data, onBucketClick }: AgingBucketsChartProps) {
  const [viewMode, setViewMode] = useState<"standard" | "custom">("standard")

  const chartColors = {
    invoiceCount: "#3b82f6",
    totalAmount: "#22c55e",
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Aging Buckets</CardTitle>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "standard" | "custom")}>
            <TabsList className="h-8">
              <TabsTrigger value="standard" className="text-xs px-3">Standard</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs px-3">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(data) => {
                if (data?.activeLabel && onBucketClick) {
                  onBucketClick(data.activeLabel)
                }
              }}
            >
              <XAxis 
                dataKey="bucket" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => value}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
              <Bar
                yAxisId="left"
                dataKey="invoiceCount"
                name="Invoice Count"
                fill={chartColors.invoiceCount}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                yAxisId="right"
                dataKey="totalAmount"
                name="Total Amount"
                fill={chartColors.totalAmount}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
