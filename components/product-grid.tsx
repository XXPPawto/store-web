"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CategoryFilter } from "@/components/category-filter"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  categories: {
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch data on client side
    if (typeof window !== "undefined") {
      fetchProducts()
      fetchCategories()
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setError(null)

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase configuration is missing")
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .order("created_at", { ascending: false })

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
          categories: {
            name: categoryMap[product.category_id] || "Unknown",
          },
        })) || []

      setProducts(productsWithCategories)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please check your configuration.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category_id === selectedCategory)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-muted-foreground">
          Please make sure your Supabase environment variables are configured correctly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
