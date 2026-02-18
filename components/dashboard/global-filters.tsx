"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, RotateCcwIcon, UsersIcon, CheckIcon } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import {
  roles,
  businessUnits,
  getPortfolioOwners,
} from "@/lib/data"

interface GlobalFiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  businessUnit: string
  entity: string
  customer: string
  currency: string
  role: string
  selectedOwners: string[]
  dateRange: DateRange | undefined
}

export function GlobalFilters({ onFilterChange }: GlobalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    businessUnit: "all",
    entity: "all",
    customer: "all",
    currency: "INR",
    role: "all",
    selectedOwners: [],
    dateRange: undefined,
  })

  const [ownerPopoverOpen, setOwnerPopoverOpen] = useState(false)

  // Derive available portfolio owners based on role and BU filters
  const availableOwners = useMemo(() => {
    return getPortfolioOwners(filters.role, filters.businessUnit)
  }, [filters.role, filters.businessUnit])

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }

    // When role or BU changes, clear selected owners that are no longer available
    if (key === "role" || key === "businessUnit") {
      const newAvailable = getPortfolioOwners(
        key === "role" ? (value as string) : newFilters.role,
        key === "businessUnit" ? (value as string) : newFilters.businessUnit
      )
      newFilters.selectedOwners = newFilters.selectedOwners.filter((o) =>
        newAvailable.includes(o)
      )
    }

    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleOwner = (owner: string) => {
    const current = filters.selectedOwners
    const updated = current.includes(owner)
      ? current.filter((o) => o !== owner)
      : [...current, owner]
    updateFilter("selectedOwners", updated)
  }

  const selectAllOwners = () => {
    updateFilter("selectedOwners", [...availableOwners])
  }

  const clearAllOwners = () => {
    updateFilter("selectedOwners", [])
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      businessUnit: "all",
      entity: "all",
      customer: "all",
      currency: "INR",
      role: "all",
      selectedOwners: [],
      dateRange: undefined,
    }
    setFilters(defaultFilters)
    onFilterChange?.(defaultFilters)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border shadow-sm">
      {/* Business Unit */}
      <Select
        value={filters.businessUnit}
        onValueChange={(value) => updateFilter("businessUnit", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Business Unit" />
        </SelectTrigger>
        <SelectContent>
          {businessUnits.map((bu) => (
            <SelectItem key={bu.value} value={bu.value}>
              {bu.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Entity */}
      <Select
        value={filters.entity}
        onValueChange={(value) => updateFilter("entity", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Legal Entity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Entities</SelectItem>
          <SelectItem value="entity-1">Corp Inc.</SelectItem>
          <SelectItem value="entity-2">Global Ltd.</SelectItem>
          <SelectItem value="entity-3">Tech GmbH</SelectItem>
        </SelectContent>
      </Select>

      {/* Role */}
      <Select
        value={filters.role}
        onValueChange={(value) => updateFilter("role", value)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Portfolio Owner Multi-Select */}
      <Popover open={ownerPopoverOpen} onOpenChange={setOwnerPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[220px] justify-start text-left font-normal",
              filters.selectedOwners.length === 0 && "text-muted-foreground"
            )}
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            {filters.selectedOwners.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="truncate">
                  {filters.selectedOwners.length === 1
                    ? filters.selectedOwners[0]
                    : `${filters.selectedOwners.length} selected`}
                </span>
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {filters.selectedOwners.length}
                </Badge>
              </span>
            ) : (
              <span>Portfolio Owner</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search owners..." />
            <div className="flex items-center gap-2 p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={selectAllOwners}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={clearAllOwners}
              >
                Clear All
              </Button>
            </div>
            <CommandList>
              <CommandEmpty>No owners found.</CommandEmpty>
              <CommandGroup>
                {availableOwners.map((owner) => {
                  const isSelected = filters.selectedOwners.includes(owner)
                  return (
                    <CommandItem
                      key={owner}
                      value={owner}
                      onSelect={() => toggleOwner(owner)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
                        <span>{owner}</span>
                        {isSelected && (
                          <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Currency */}
      <Select
        value={filters.currency}
        onValueChange={(value) => updateFilter("currency", value)}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INR">INR</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[220px] justify-start text-left font-normal",
              !filters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange}
            onSelect={(range) => updateFilter("dateRange", range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetFilters}
        className="text-muted-foreground hover:text-foreground"
      >
        <RotateCcwIcon className="mr-1.5 h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}
