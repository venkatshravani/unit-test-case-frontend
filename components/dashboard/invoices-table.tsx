"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MoreHorizontalIcon, 
  SearchIcon, 
  UserPlusIcon, 
  EditIcon, 
  StickyNoteIcon, 
  SendIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon
} from "lucide-react"

export interface Invoice {
  id: string
  collectionAgent: string
  customer: string
  customerAccount?: string
  customerGroup?: string
  invoiceNo: string
  invoiceDate: string
  invoiceProcessingDate: string
  dueDate?: string
  value: number
  previousOutstandingAmount: number
  balance?: number
  accountingCurrencyBalance?: number
  reportingCurrencyBalance?: number
  description?: string
  firstFollowUpScheduled: string
  firstFollowUpActual: string
  subsequentFollowUpActual: string
  previousOutstandingInvoiceNo: string
  collectionTarget: number
  creditPeriod: number
  penalInterest: boolean
  overdue: boolean
  reasonForOverdue: string
  documentCurrency?: string
  accountingCurrency?: string
  reportingCurrency?: string
  project?: string
  vendor?: string
  worker?: string
  onsiteOffshore?: string
  revisedOverdueBucket?: string
  closedDate?: string
  company?: string
  asapla?: string
  customerReferenceSoFo?: string
  businessUnit?: string
  costCenter?: string
  geo?: string
}

interface InvoicesTableProps {
  invoices: Invoice[]
  onAssignOwner?: (invoiceId: string) => void
  onUpdateStatus?: (invoiceId: string) => void
  onAddNote?: (invoiceId: string) => void
  onTriggerReminder?: (invoiceId: string) => void
  onUpdateInvoice?: (invoiceId: string, updates: { firstFollowUpActual: string; subsequentFollowUpActual: string; notes?: string }) => void
  hideCollectionAgent?: boolean
}

export function InvoicesTable({
  invoices,
  onAssignOwner,
  onUpdateStatus,
  onAddNote,
  onTriggerReminder,
  onUpdateInvoice,
  hideCollectionAgent = false,
}: InvoicesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [overdueFilter, setOverdueFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Invoice detail dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editFirstFollowUp, setEditFirstFollowUp] = useState("")
  const [editSubsequentFollowUp, setEditSubsequentFollowUp] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setEditFirstFollowUp(invoice.firstFollowUpActual)
    setEditSubsequentFollowUp(invoice.subsequentFollowUpActual)
    setEditNotes("")
    setIsDetailDialogOpen(true)
  }

  const handleSaveAction = () => {
    if (selectedInvoice && onUpdateInvoice) {
      onUpdateInvoice(selectedInvoice.id, {
        firstFollowUpActual: editFirstFollowUp,
        subsequentFollowUpActual: editSubsequentFollowUp,
        notes: editNotes,
      })
    }
    setIsDetailDialogOpen(false)
    setSelectedInvoice(null)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.collectionAgent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOverdue =
      overdueFilter === "all" ||
      (overdueFilter === "yes" && invoice.overdue) ||
      (overdueFilter === "no" && !invoice.overdue)
    return matchesSearch && matchesOverdue
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatCurrency = (value: number, currency?: string) => {
    // Use invoice's document currency if available, otherwise default to INR
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "-") return "-"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices, customers, agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={overdueFilter} onValueChange={setOverdueFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Overdue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Overdue</SelectItem>
            <SelectItem value="no">Not Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold whitespace-nowrap">Customer Name</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Voucher</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Currency</TableHead>
              <TableHead className="font-semibold text-right whitespace-nowrap">Balance</TableHead>
              <TableHead className="font-semibold text-right whitespace-nowrap">Amount In</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Invoice Date</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Due Date</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Project</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Overdue Status</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Days Overdue</TableHead>
              <TableHead className="font-semibold w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => {
              const invoiceDate = new Date(invoice.invoiceDate)
              const dueDate = new Date(invoiceDate)
              dueDate.setDate(dueDate.getDate() + invoice.creditPeriod)
              const today = new Date()
              const daysOverdue = invoice.overdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
              
              return (
              <TableRow key={invoice.id} className="hover:bg-muted/30">
                <TableCell className="font-medium whitespace-nowrap">{invoice.customer}</TableCell>
                <TableCell 
                  className="font-medium text-primary cursor-pointer hover:underline whitespace-nowrap"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  {invoice.invoiceNo}
                </TableCell>
                <TableCell className="whitespace-nowrap">{invoice.documentCurrency}</TableCell>
                <TableCell className="text-right whitespace-nowrap font-medium">{formatCurrency(invoice.value, invoice.documentCurrency)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(invoice.previousOutstandingAmount, invoice.documentCurrency)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatDate(dueDate.toISOString().split('T')[0])}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{invoice.collectionTarget > 0 ? formatCurrency(invoice.collectionTarget, invoice.documentCurrency) : "-"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="secondary" className={invoice.overdue ? "bg-destructive/15 text-destructive hover:bg-destructive/15" : "bg-green-100/50 text-green-700 hover:bg-green-100/50"}>
                    {invoice.overdue ? "Overdue" : "On Time"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {daysOverdue > 0 ? (
                    <span className="text-destructive font-medium">{daysOverdue}d</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAssignOwner?.(invoice.id)}>
                        <UserPlusIcon className="mr-2 h-4 w-4" />
                        Assign Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus?.(invoice.id)}>
                        <EditIcon className="mr-2 h-4 w-4" />
                        Update Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddNote?.(invoice.id)}>
                        <StickyNoteIcon className="mr-2 h-4 w-4" />
                        Add Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTriggerReminder?.(invoice.id)}>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Send Reminder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{" "}
          {filteredInvoices.length} invoices
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5 text-primary" />
              Invoice Details - {selectedInvoice?.invoiceNo}
            </DialogTitle>
            <DialogDescription>
              View invoice details and update follow-up information
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Base Data Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Account</p>
                  <p className="font-medium">{selectedInvoice.customerAccount || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{selectedInvoice.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Group</p>
                  <p className="font-medium">{selectedInvoice.customerGroup || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voucher</p>
                  <p className="font-medium text-primary">{selectedInvoice.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : formatDate(selectedInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedInvoice.documentCurrency || "USD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount in Transaction</p>
                  <p className="font-medium">{formatCurrency(selectedInvoice.value, selectedInvoice.documentCurrency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-medium">{formatCurrency(selectedInvoice.balance || selectedInvoice.value, selectedInvoice.documentCurrency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accounting Currency Balance</p>
                  <p className="font-medium">{selectedInvoice.accountingCurrencyBalance ? formatCurrency(selectedInvoice.accountingCurrencyBalance, selectedInvoice.accountingCurrency || "USD") : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reporting Currency Balance</p>
                  <p className="font-medium">{selectedInvoice.reportingCurrencyBalance ? formatCurrency(selectedInvoice.reportingCurrencyBalance, selectedInvoice.reportingCurrency || "USD") : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium text-sm">{selectedInvoice.description || "-"}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-background border border-border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium text-sm">{selectedInvoice.project || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Unit</p>
                  <p className="font-medium text-sm">{selectedInvoice.businessUnit || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost Center</p>
                  <p className="font-medium text-sm">{selectedInvoice.costCenter || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium text-sm">{selectedInvoice.vendor || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Worker</p>
                  <p className="font-medium text-sm">{selectedInvoice.worker || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Onsite/Offshore</p>
                  <p className="font-medium text-sm">{selectedInvoice.onsiteOffshore || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revised Overdue Bucket</p>
                  <p className="font-medium text-sm">{selectedInvoice.revisedOverdueBucket || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Geo</p>
                  <p className="font-medium text-sm">{selectedInvoice.geo || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium text-sm">{selectedInvoice.company || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Reference SO-FO</p>
                  <p className="font-medium text-sm">{selectedInvoice.customerReferenceSoFo || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asapla Document</p>
                  <p className="font-medium text-sm">{selectedInvoice.asapla || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Closed Date</p>
                  <p className="font-medium text-sm">{selectedInvoice.closedDate ? formatDate(selectedInvoice.closedDate) : "-"}</p>
                </div>
              </div>

              {/* Follow-Up Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-primary" />
                  Follow-Up Details
                </h4>

                <div className="grid gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Scheduled 1st Follow-Up</p>
                    <p className="font-medium">{formatDate(selectedInvoice.firstFollowUpScheduled)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstFollowUp">Actual 1st Follow-Up Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstFollowUp"
                        type="date"
                        value={editFirstFollowUp}
                        onChange={(e) => setEditFirstFollowUp(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subsequentFollowUp">Subsequent Follow-Up Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="subsequentFollowUp"
                        type="date"
                        value={editSubsequentFollowUp}
                        onChange={(e) => setEditSubsequentFollowUp(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes about this follow-up..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAction} className="gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              Save Follow-Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
