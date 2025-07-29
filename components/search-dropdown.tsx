"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  is_available?: boolean
  categories: {
    name: string
  }
}

interface SearchDropdownProps {
  onSearch?: (query: string) => void
  searchQuery?: string
  placeholder?: string
  className?: string
}

export function SearchDropdown({
  onSearch,
  searchQuery = "",
  placeholder = "Search products...",
  className = "",
}: SearchDropdownProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localQuery.trim().length >= 2) {
        searchProducts(localQuery.trim())
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(delayedSearch)
  }, [localQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchProducts = async (query: string) => {
    if (!supabase) return

    setLoading(true)
    try {
      // Try to fetch with is_available column first
      let productsData, productsError

      try {
        const result = await supabase
          .from("products")
          .select("*, is_available")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(8)

        productsData = result.data
        productsError = result.error
      } catch (columnError) {
        const result = await supabase
          .from("products")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(8)

        productsData = result.data
        productsError = result.error
      }

      if (productsError) throw productsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) throw categoriesError

      const categoryMap =
        categoriesData?.reduce(
          (acc, category) => {
            acc[category.id] = category.name
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      const productsWithCategories =
        productsData?.map((product) => ({
          ...product,
          is_available: product.is_available ?? true,
          categories: {
            name: categoryMap[product.category_id] || "Unknown",
          },
        })) || []

      // Filter only available products
      const availableProducts = productsWithCategories.filter((product) => product.is_available !== false)

      setSuggestions(availableProducts)
      setIsOpen(availableProducts.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Error searching products:", error)
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setLocalQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    setLocalQuery("")
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    if (onSearch) {
      onSearch("")
    }
    inputRef.current?.focus()
  }

  const handleProductClick = (product: Product) => {
    setIsOpen(false)
    setLocalQuery(product.name)
    setSelectedIndex(-1)

    // Add to recently viewed
    if (typeof window !== "undefined") {
      const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
      const filtered = recent.filter((p: Product) => p.id !== product.id)
      const updated = [product, ...filtered].slice(0, 10)
      localStorage.setItem("recentlyViewed", JSON.stringify(updated))
    }

    if (onSearch) {
      onSearch(product.name)
    }
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()

    if (product.stock <= 0) {
      toast.error("Product is out of stock")
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })

    toast.success(`${product.name} added to cart!`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleProductClick(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Sold Out", variant: "destructive" as const }
    if (product.stock <= 5) return { label: `${product.stock} left`, variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((product, index) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                        index === selectedIndex ? "bg-muted/50" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=48&width=48&query=pet"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{product.categories.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-emerald-600 text-sm">
                                Rp {product.price.toLocaleString("id-ID")}
                              </span>
                              <Badge variant={stockStatus.variant} className="text-xs px-1 py-0">
                                {stockStatus.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Add to Cart Button */}
                          {product.stock > 0 && (
                            <Button
                              size="sm"
                              onClick={(e) => handleAddToCart(e, product)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2 py-1 h-7 flex-shrink-0"
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">No products found for "{localQuery}"</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
