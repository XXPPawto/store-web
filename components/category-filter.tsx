"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  category_id: string
  stock: number
  is_available?: boolean
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  products?: Product[]
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange, products = [] }: CategoryFilterProps) {
  // Count products per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") {
      return products.filter((p) => p.is_available !== false).length
    }
    return products.filter((p) => p.category_id === categoryId && p.is_available !== false).length
  }

  // Count sold out products per category
  const getSoldOutCount = (categoryId: string) => {
    if (categoryId === "all") {
      return products.filter((p) => p.stock === 0 && p.is_available !== false).length
    }
    return products.filter((p) => p.category_id === categoryId && p.stock === 0 && p.is_available !== false).length
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => onCategoryChange("all")}
          className="relative"
        >
          All Categories
          <Badge variant="secondary" className="ml-2">
            {getCategoryCount("all")}
          </Badge>
          {getSoldOutCount("all") > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {getSoldOutCount("all")} sold
            </Badge>
          )}
        </Button>
      </div>

      {categories.map((category) => {
        const totalCount = getCategoryCount(category.id)
        const soldOutCount = getSoldOutCount(category.id)

        return (
          <div key={category.id} className="flex items-center gap-2">
            <Button
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className="relative"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {totalCount}
              </Badge>
              {soldOutCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {soldOutCount} sold
                </Badge>
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
