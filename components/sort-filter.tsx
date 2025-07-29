"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

interface SortFilterProps {
  onSortChange: (sortBy: string) => void
  currentSort: string
}

export function SortFilter({ onSortChange, currentSort }: SortFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price_high">Price: High to Low</SelectItem>
          <SelectItem value="price_low">Price: Low to High</SelectItem>
          <SelectItem value="name_asc">Name: A to Z</SelectItem>
          <SelectItem value="name_desc">Name: Z to A</SelectItem>
          <SelectItem value="stock_high">Stock: High to Low</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
