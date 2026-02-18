"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileTextIcon, 
  DownloadIcon,
  BarChart3Icon,
  PieChartIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon
} from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: "aging" | "performance" | "customer" | "forecast"
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "aging-summary",
    name: "Aging Summary Report",
    description: "Overview of outstanding invoices grouped by aging buckets",
    icon: BarChart3Icon,
    category: "aging",
  },
  {
    id: "aging-detail",
    name: "Aging Detail Report",
    description: "Detailed breakdown of all outstanding invoices with aging",
    icon: FileTextIcon,
    category: "aging",
  },
  {
    id: "collection-performance",
    name: "Collection Performance",
    description: "Metrics on collection efficiency and collector performance",
    icon: TrendingUpIcon,
    category: "performance",
  },
  {
    id: "dso-analysis",
    name: "DSO Analysis Report",
    description: "Days Sales Outstanding trends and analysis",
    icon: PieChartIcon,
    category: "performance",
  },
  {
    id: "customer-statement",
    name: "Customer Statement",
    description: "Account statement for individual customers",
    icon: UsersIcon,
    category: "customer",
  },
  {
    id: "payment-forecast",
    name: "Payment Forecast Report",
    description: "Projected cash inflows based on commitments",
    icon: CalendarIcon,
    category: "forecast",
  },
]

interface ReportsTabProps {
  onGenerateReport?: (reportId: string, format: string) => void
}

export function ReportsTab({ onGenerateReport }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map((report) => (
          <Card key={report.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{report.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="flex-1"
                  onClick={() => onGenerateReport?.(report.id, "pdf")}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Scheduled Reports</CardTitle>
          <CardDescription>
            Set up automated report generation and delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No scheduled reports configured</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              Schedule a Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
