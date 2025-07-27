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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Update the fetchProducts function to handle the relationship properly

  const fetchProducts = async () => {
    try {
      // First, let's try a simpler approach by fetching products and categories separately
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .order("created_at", { ascending: false })

      if (productsError) throw productsError

      // Fetch categories separately
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) throw categoriesError

      // Create a map of category IDs to category names
      const categoryMap =
        categoriesData?.reduce(
          (acc, category) => {
            acc[category.id] = category.name
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      // Combine the data
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
      // Set empty array on error to prevent infinite loading
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
