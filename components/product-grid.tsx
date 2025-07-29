"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CategoryFilter } from "@/components/category-filter"
import { SortFilter } from "@/components/sort-filter"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { QuickViewModal } from "@/components/quick-view-modal"
import { ProductRecommendations } from "@/components/product-recommendations"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  is_available?: boolean
  created_at: string
  categories: {
    name: string
  }
}

interface Category {
  id: string
  name: string
}

interface ProductGridProps {
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
}

export function ProductGrid({ searchQuery = "", onSearchQueryChange }: ProductGridProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("price_high")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [showQuickView, setShowQuickView] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured. Please check your environment variables.")
        setLoading(false)
        return
      }
      fetchProducts()
      fetchCategories()
    }
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [allProducts, selectedCategory, searchQuery, sortBy])

  const fetchProducts = async () => {
    if (!supabase) {
      setError("Supabase client is not available")
      setLoading(false)
      return
    }

    try {
      setError(null)

      let productsData, productsError

      try {
        const result = await supabase
          .from("products")
          .select("*, is_available")
          .order("created_at", { ascending: false })

        productsData = result.data
        productsError = result.error
      } catch (columnError) {
        const result = await supabase.from("products").select("*").order("created_at", { ascending: false })

        productsData = result.data
        productsError = result.error
      }

      if (productsError) throw productsError

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

      const visibleProducts = productsWithCategories.filter((product) => product.is_available !== false)

      setAllProducts(visibleProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please check your configuration.")
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("categories").select("*")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...allProducts]

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category_id === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.categories.name.toLowerCase().includes(query),
      )
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_high":
          return b.price - a.price
        case "price_low":
          return a.price - b.price
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "stock_high":
          return b.stock - a.stock
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return b.price - a.price
      }
    })

    setFilteredProducts(filtered)
  }

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
    setShowQuickView(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse rounded-lg w-full md:w-48" />
        </div>
        <div className="h-12 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse rounded-lg w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 md:h-80 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Environment variables status:</p>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sort Control - Top Right */}
      <div className="flex justify-end">
        <SortFilter onSortChange={setSortBy} currentSort={sortBy} />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        products={allProducts}
      />

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing {filteredProducts.length} of {allProducts.length} products
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {searchQuery && onSearchQueryChange && (
          <button onClick={() => onSearchQueryChange("")} className="text-emerald-600 hover:underline">
            Clear search
          </button>
        )}
      </div>

      {/* Products Grid - Optimized for mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-4xl md:text-6xl mb-4">🔍</div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? `No products match "${searchQuery}"` : "No products found in this category"}
          </p>
          {(searchQuery || selectedCategory !== "all") && onSearchQueryChange && (
            <div className="flex gap-2 justify-center">
              {searchQuery && (
                <button onClick={() => onSearchQueryChange("")} className="text-emerald-600 hover:underline">
                  Clear search
                </button>
              )}
              {selectedCategory !== "all" && (
                <button onClick={() => setSelectedCategory("all")} className="text-emerald-600 hover:underline">
                  View all categories
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />

      {/* Product Recommendations */}
      {filteredProducts.length > 0 && (
        <div className="mt-12">
          <ProductRecommendations title="Recommended for You" maxItems={4} />
        </div>
      )}
    </div>
  )
}
