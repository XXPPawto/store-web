"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)

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

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
      setShowScrollHint(false)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
      setShowScrollHint(false)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      return () => container.removeEventListener("scroll", checkScrollButtons)
    }
  }, [categories])

  useEffect(() => {
    // Hide scroll hint after 3 seconds
    const timer = setTimeout(() => {
      setShowScrollHint(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full">
      {/* Mobile: Horizontal scroll with indicators */}
      <div className="md:hidden relative">
        {/* Scroll hint */}
        {showScrollHint && categories.length > 2 && (
          <div className="absolute top-0 right-0 z-10 bg-emerald-600 text-white text-xs px-2 py-1 rounded-bl-lg animate-bounce">
            Swipe →
          </div>
        )}

        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 shadow-lg w-8 h-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 shadow-lg w-8 h-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-8"
          onScroll={checkScrollButtons}
        >
          <div className="flex-shrink-0">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => onCategoryChange("all")}
              className="relative whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 data-[state=active]:bg-emerald-600"
              size="sm"
            >
              All Categories
              <Badge variant="secondary" className="ml-2 text-xs">
                {getCategoryCount("all")}
              </Badge>
              {getSoldOutCount("all") > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1">
                  {getSoldOutCount("all")}
                </Badge>
              )}
            </Button>
          </div>

          {categories.map((category) => {
            const totalCount = getCategoryCount(category.id)
            const soldOutCount = getSoldOutCount(category.id)

            return (
              <div key={category.id} className="flex-shrink-0">
                <Button
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => onCategoryChange(category.id)}
                  className="relative whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 data-[state=active]:bg-emerald-600"
                  size="sm"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {totalCount}
                  </Badge>
                  {soldOutCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs px-1">
                      {soldOutCount}
                    </Badge>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center mt-2 gap-1">
          <div className={`w-2 h-1 rounded-full transition-colors ${canScrollLeft ? "bg-gray-400" : "bg-gray-200"}`} />
          <div className={`w-2 h-1 rounded-full transition-colors ${canScrollRight ? "bg-gray-400" : "bg-gray-200"}`} />
        </div>
      </div>

      {/* Desktop: Flex wrap */}
      <div className="hidden md:flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => onCategoryChange("all")}
            className="relative bg-emerald-600 hover:bg-emerald-700"
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
                className="relative bg-emerald-600 hover:bg-emerald-700"
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
    </div>
  )
}
