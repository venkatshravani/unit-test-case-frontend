"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { 
  PhoneIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  CalendarIcon,
  DollarSignIcon,
  PercentIcon,
  SendIcon,
  SaveIcon,
  RefreshCwIcon
} from "lucide-react"

interface CallRecord {
  id: string
  customer: string
  invoiceNo: string
  callDate: string
  duration: string
  status: "completed" | "missed" | "scheduled"
}

interface AIExtraction {
  promisedAmount: number | null
  promisedDate: string | null
  confidenceScore: number
  summary: string
  nextSteps: string[]
}

interface CallsTabProps {
  calls: CallRecord[]
  selectedCall?: CallRecord
  transcription?: string
  aiExtraction?: AIExtraction
  onSelectCall?: (call: CallRecord) => void
  onSaveCommitment?: (callId: string, data: AIExtraction) => void
  onUpdateInvoice?: (callId: string) => void
  onSendSummary?: (callId: string) => void
}

const statusConfig = {
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  missed: { label: "Missed", className: "bg-red-100 text-red-800" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
}

export function CallsTab({
  calls,
  selectedCall,
  transcription,
  aiExtraction,
  onSelectCall,
  onSaveCommitment,
  onUpdateInvoice,
  onSendSummary,
}: CallsTabProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [editedExtraction, setEditedExtraction] = useState<AIExtraction | null>(null)

  const currentExtraction = editedExtraction || aiExtraction

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)] min-h-[500px]">
      {/* Call List */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4 pt-0">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCall?.id === call.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => onSelectCall?.(call)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <PhoneIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{call.customer}</p>
                          <p className="text-xs text-muted-foreground">{call.invoiceNo}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={statusConfig[call.status].className}>
                        {statusConfig[call.status].label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(call.callDate).toLocaleDateString()}</span>
                      <span>{call.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Call Details */}
      <div className="lg:col-span-2 space-y-4">
        {selectedCall ? (
          <>
            {/* Audio & Transcription */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Call with {selectedCall.customer}
                  </CardTitle>
                  <Badge variant="outline">{selectedCall.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Audio Player */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">2:34 / {selectedCall.duration}</span>
                </div>

                {/* Transcription */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Transcription</h4>
                  <ScrollArea className="h-[150px] border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {transcription || "No transcription available for this call."}
                    </p>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* AI Extracted Fields */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">AI Extracted Fields</CardTitle>
                  {currentExtraction && (
                    <div className="flex items-center gap-2">
                      <PercentIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {Math.round(currentExtraction.confidenceScore * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentExtraction ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                          Promised Amount
                        </label>
                        <Input
                          type="number"
                          value={currentExtraction.promisedAmount || ""}
                          onChange={(e) =>
                            setEditedExtraction({
                              ...currentExtraction,
                              promisedAmount: parseFloat(e.target.value) || null,
                            })
                          }
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          Promised Date
                        </label>
                        <Input
                          type="date"
                          value={currentExtraction.promisedDate || ""}
                          onChange={(e) =>
                            setEditedExtraction({
                              ...currentExtraction,
                              promisedDate: e.target.value || null,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Post-Call Summary */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Discussion Highlights</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {currentExtraction.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Next Steps</h4>
                      <ul className="space-y-1">
                        {currentExtraction.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => onSaveCommitment?.(selectedCall.id, currentExtraction)}
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Commitment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onUpdateInvoice?.(selectedCall.id)}
                      >
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Update Invoice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onSendSummary?.(selectedCall.id)}
                      >
                        <SendIcon className="h-4 w-4 mr-2" />
                        Send Summary to Finance
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No AI extraction available for this call</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-sm h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <PhoneIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Select a call to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
