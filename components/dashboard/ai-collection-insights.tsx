"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, ArrowRightIcon } from "lucide-react"

interface AIInsight {
  id: string
  riskLevel: "high" | "medium" | "low"
  customer: string
  overdueAmount: number
  days: number
  recommendation: string
  action: string
  actionLabel: string
}

interface AICollectionInsightsProps {
  invoices: any[]
}

export function AICollectionInsights({ invoices }: AICollectionInsightsProps) {
  // Generate insights from invoice data
  const insights: AIInsight[] = invoices
    .filter(inv => inv.overdue)
    .slice(0, 3)
    .map((inv, idx) => {
      const days = Math.floor((Date.now() - new Date(inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24))
      const riskLevel = days > 120 ? "high" : days > 60 ? "medium" : "low"
      
      return {
        id: inv.id,
        riskLevel,
        customer: inv.customer,
        overdueAmount: inv.value,
        days,
        recommendation: 
          riskLevel === "high" 
            ? "Escalate to Finance Head"
            : riskLevel === "medium"
            ? "Send Reminder Email"
            : "Schedule Follow-up Call",
        action: riskLevel === "high" ? "escalate" : riskLevel === "medium" ? "email" : "call",
        actionLabel: riskLevel === "high" ? "View Details" : riskLevel === "medium" ? "Send Reminder" : "Call Now",
      }
    })

  const getRiskIcon = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
      case "low":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
  }

  const getRiskBgColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-red-50 border-red-200"
      case "medium":
        return "bg-orange-50 border-orange-200"
      case "low":
        return "bg-green-50 border-green-200"
    }
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span>🧠</span>
          AI Collection Insights
        </CardTitle>
        <p className="text-xs text-muted-foreground">Smart recommendations for collection priority</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {insights.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No overdue invoices requiring action</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border-2 ${getRiskBgColor(insight.riskLevel)} space-y-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {getRiskIcon(insight.riskLevel)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      {insight.riskLevel === "high" ? "High Risk" : insight.riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
                    </p>
                    <p className="font-semibold text-sm truncate">{insight.customer}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">Overdue:</span>
                <span className="text-muted-foreground">{insight.days} Days</span>
              </div>

              <div className="pt-2 border-t border-current border-opacity-10">
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Recommendation:</span>
                </p>
                <p className="text-sm font-medium text-foreground mb-3">{insight.recommendation}</p>
                <Button
                  size="sm"
                  variant={insight.riskLevel === "high" ? "destructive" : "outline"}
                  className="w-full text-xs h-7"
                >
                  {insight.actionLabel}
                  <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
