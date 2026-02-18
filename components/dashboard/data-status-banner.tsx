"use client"

import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DataStatusBanner() {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertCircleIcon className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 ml-2">
        ⚠️ Currently showing Sample Data — D365 integration in progress
      </AlertDescription>
    </Alert>
  )
}
