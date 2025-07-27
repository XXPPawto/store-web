"use client"

import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => onCategoryChange("all")}>
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
