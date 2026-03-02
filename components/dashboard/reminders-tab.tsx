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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MailIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  PlusIcon,
  EditIcon
} from "lucide-react"

interface ReminderRule {
  id: string
  name: string
  daysBefore: number
  template: string
  enabled: boolean
}

interface SentReminder {
  id: string
  invoiceNo: string
  customer: string
  sentDate: string
  status: "sent" | "opened" | "clicked" | "bounced"
  type: string
}

interface RemindersTabProps {
  rules: ReminderRule[]
  sentReminders: SentReminder[]
  selectedReminder?: SentReminder
  onRuleToggle?: (ruleId: string, enabled: boolean) => void
  onSelectReminder?: (reminder: SentReminder) => void
}

const statusConfig = {
  sent: { label: "Sent", icon: MailIcon, className: "bg-blue-100 text-blue-800" },
  opened: { label: "Opened", icon: CheckCircleIcon, className: "bg-green-100 text-green-800" },
  clicked: { label: "Clicked", icon: CheckCircleIcon, className: "bg-emerald-100 text-emerald-800" },
  bounced: { label: "Bounced", icon: AlertCircleIcon, className: "bg-red-100 text-red-800" },
}

export function RemindersTab({
  rules,
  sentReminders,
  selectedReminder,
  onRuleToggle,
  onSelectReminder,
}: RemindersTabProps) {
  const [activeTab, setActiveTab] = useState("upcoming")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Reminder Rules Panel */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Reminder Rules</CardTitle>
              <Button size="sm" variant="outline">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rule.daysBefore > 0 
                          ? `${rule.daysBefore} days before due` 
                          : rule.daysBefore === 0 
                            ? "On due date" 
                            : `${Math.abs(rule.daysBefore)} days after due`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="ghost">
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={rule.enabled}
                        onCheckedChange={(checked) => onRuleToggle?.(rule.id, checked)}
                      />
                      <Label htmlFor={`rule-${rule.id}`} className="sr-only">
                        Enable rule
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reminders Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Invoice</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">
                    {activeTab === "upcoming" ? "Scheduled" : "Sent Date"}
                  </TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentReminders.map((reminder) => {
                  const status = statusConfig[reminder.status]
                  return (
                    <TableRow
                      key={reminder.id}
                      className={`cursor-pointer hover:bg-muted/30 ${
                        selectedReminder?.id === reminder.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => onSelectReminder?.(reminder)}
                    >
                      <TableCell className="font-medium">{reminder.invoiceNo}</TableCell>
                      <TableCell>{reminder.customer}</TableCell>
                      <TableCell>
                        {new Date(reminder.sentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{reminder.type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.className}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview Panel */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReminder ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="border-b pb-3">
                    <p className="text-xs text-muted-foreground">To:</p>
                    <p className="text-sm font-medium">{selectedReminder.customer}</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-xs text-muted-foreground">Subject:</p>
                    <p className="text-sm font-medium">
                      Payment Reminder: Invoice {selectedReminder.invoiceNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Body:</p>
                    <div className="text-sm space-y-2 text-foreground/80">
                      <p>Dear Valued Customer,</p>
                      <p>
                        This is a friendly reminder that Invoice{" "}
                        <strong>{selectedReminder.invoiceNo}</strong> is due for payment.
                      </p>
                      <div className="bg-card border rounded-md p-3 my-3">
                        <table className="w-full text-xs">
                          <tbody>
                            <tr>
                              <td className="py-1 text-muted-foreground">Invoice No:</td>
                              <td className="py-1 font-medium text-right">{selectedReminder.invoiceNo}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-muted-foreground">Amount Due:</td>
                              <td className="py-1 font-medium text-right">$15,000</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-muted-foreground">Due Date:</td>
                              <td className="py-1 font-medium text-right">Jan 15, 2026</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p>Please arrange payment at your earliest convenience.</p>
                      <p className="pt-2">Best regards,<br />Accounts Receivable Team</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  <MailIcon className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MailIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a reminder to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
