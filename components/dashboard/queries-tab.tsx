"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  PlusIcon, 
  SearchIcon,
  MessageSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from "lucide-react"

interface Query {
  id: string
  queryNo: string
  invoiceNo: string
  customer: string
  type: "dispute" | "clarification" | "payment_plan" | "other"
  status: "open" | "pending" | "resolved" | "escalated"
  createdDate: string
  description: string
  assignee: string
}

interface QueriesTabProps {
  queries: Query[]
  onCreateQuery?: (query: Partial<Query>) => void
  onUpdateQuery?: (queryId: string, updates: Partial<Query>) => void
}

const typeConfig = {
  dispute: { label: "Dispute", className: "bg-red-100 text-red-800" },
  clarification: { label: "Clarification", className: "bg-blue-100 text-blue-800" },
  payment_plan: { label: "Payment Plan", className: "bg-purple-100 text-purple-800" },
  other: { label: "Other", className: "bg-gray-100 text-gray-800" },
}

const statusConfig = {
  open: { label: "Open", icon: MessageSquareIcon, className: "bg-yellow-100 text-yellow-800" },
  pending: { label: "Pending", icon: ClockIcon, className: "bg-blue-100 text-blue-800" },
  resolved: { label: "Resolved", icon: CheckCircleIcon, className: "bg-green-100 text-green-800" },
  escalated: { label: "Escalated", icon: AlertTriangleIcon, className: "bg-red-100 text-red-800" },
}

export function QueriesTab({ queries, onCreateQuery }: QueriesTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newQuery, setNewQuery] = useState({
    invoiceNo: "",
    type: "dispute" as Query["type"],
    description: "",
  })

  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.queryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || query.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateQuery = () => {
    onCreateQuery?.(newQuery)
    setIsDialogOpen(false)
    setNewQuery({ invoiceNo: "", type: "dispute", description: "" })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Query</DialogTitle>
              <DialogDescription>
                Log a new customer query or dispute for tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice Number</Label>
                <Input
                  id="invoiceNo"
                  value={newQuery.invoiceNo}
                  onChange={(e) => setNewQuery({ ...newQuery, invoiceNo: e.target.value })}
                  placeholder="INV-2025-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Query Type</Label>
                <Select
                  value={newQuery.type}
                  onValueChange={(value) => setNewQuery({ ...newQuery, type: value as Query["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="clarification">Clarification</SelectItem>
                    <SelectItem value="payment_plan">Payment Plan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                  placeholder="Describe the query..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuery}>Create Query</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Query No</TableHead>
                <TableHead className="font-semibold">Invoice</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.map((query) => {
                const status = statusConfig[query.status]
                const type = typeConfig[query.type]
                return (
                  <TableRow key={query.id} className="hover:bg-muted/30 cursor-pointer">
                    <TableCell className="font-medium text-primary">{query.queryNo}</TableCell>
                    <TableCell>{query.invoiceNo}</TableCell>
                    <TableCell>{query.customer}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={type.className}>
                        {type.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(query.createdDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{query.assignee}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
