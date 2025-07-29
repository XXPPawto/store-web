"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { Sparkles, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

interface ProductRecommendationsProps {
  currentProductId?: string
  categoryId?: string
  title?: string
  maxItems?: number
}

export function ProductRecommendations({
  currentProductId,
  categoryId,
  title = "You Might Also Like",
  maxItems = 4,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [currentProductId, categoryId])

  const fetchRecommendations = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      let query = supabase.from("products").select("*")

      // Exclude current product
      if (currentProductId) {
        query = query.neq("id", currentProductId)
      }

      // Prioritize same category
      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      // Try to fetch with is_available column first
      let productsData, productsError

      try {
        const result = await query.select("*, is_available").limit(maxItems * 2)
        productsData = result.data
        productsError = result.error
      } catch (columnError) {
        const result = await query.limit(maxItems * 2)
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

      // Filter available products and apply smart recommendations
      const availableProducts = productsWithCategories.filter((product) => product.is_available !== false)

      // Smart recommendation algorithm
      const smartRecommendations = getSmartRecommendations(availableProducts, currentProductId, categoryId)

      setRecommendations(smartRecommendations.slice(0, maxItems))
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const getSmartRecommendations = (products: Product[], currentId?: string, catId?: string): Product[] => {
    // Get recently viewed products
    const recentlyViewed =
      typeof window !== "undefined" ? JSON.parse(localStorage.getItem("recentlyViewed") || "[]") : []

    // Get cart items
    const cartItems = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("cart") || "[]") : []

    // Scoring algorithm
    const scoredProducts = products.map((product) => {
      let score = 0

      // Base score from price range (similar price products)
      if (currentId) {
        const currentProduct = products.find((p) => p.id === currentId)
        if (currentProduct) {
          const priceDiff = Math.abs(product.price - currentProduct.price)
          const priceScore = Math.max(0, 100 - (priceDiff / currentProduct.price) * 100)
          score += priceScore * 0.3
        }
      }

      // Category bonus
      if (catId && product.category_id === catId) {
        score += 50
      }

      // Recently viewed bonus
      if (recentlyViewed.some((rv: Product) => rv.category_id === product.category_id)) {
        score += 30
      }

      // Cart affinity bonus
      if (cartItems.some((ci: any) => ci.category_id === product.category_id)) {
        score += 40
      }

      // Stock availability bonus
      if (product.stock > 0) {
        score += 20
      }

      // Premium product bonus
      if (product.price > 100000) {
        score += 15
      }

      // Random factor for variety
      score += Math.random() * 10

      return { ...product, score }
    })

    // Sort by score and return
    return scoredProducts.sort((a, b) => b.score - a.score).map(({ score, ...product }) => product)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          {title}
          <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Smart picks for you
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
