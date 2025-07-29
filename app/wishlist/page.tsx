"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
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

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchWishlistProducts()
  }, [])

  const fetchWishlistProducts = async () => {
    if (typeof window === "undefined" || !supabase) {
      setLoading(false)
      return
    }

    try {
      const wishlistIds = JSON.parse(localStorage.getItem("wishlist") || "[]")

      if (wishlistIds.length === 0) {
        setWishlistProducts([])
        setLoading(false)
        return
      }

      // Fetch products from database
      let productsData, productsError

      try {
        const result = await supabase.from("products").select("*, is_available").in("id", wishlistIds)

        productsData = result.data
        productsError = result.error
      } catch (columnError) {
        const result = await supabase.from("products").select("*").in("id", wishlistIds)

        productsData = result.data
        productsError = result.error
      }

      if (productsError) {
        console.error("Products error:", productsError)
        toast.error("Failed to fetch wishlist products")
        setLoading(false)
        return
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) {
        console.error("Categories error:", categoriesError)
        toast.error("Failed to fetch categories")
        setLoading(false)
        return
      }

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

      setWishlistProducts(productsWithCategories)
    } catch (error) {
      console.error("Error fetching wishlist products:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const clearWishlist = () => {
    if (typeof window === "undefined") return

    localStorage.setItem("wishlist", JSON.stringify([]))
    setWishlistProducts([])
    window.dispatchEvent(new Event("wishlistUpdated"))
    toast.success("Wishlist cleared!")
  }

  const removeFromWishlist = (productId: string, productName: string) => {
    if (typeof window === "undefined") return

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const newWishlist = wishlist.filter((id: string) => id !== productId)
    localStorage.setItem("wishlist", JSON.stringify(newWishlist))

    setWishlistProducts((prev) => prev.filter((p) => p.id !== productId))
    window.dispatchEvent(new Event("wishlistUpdated"))
    toast.success(`${productName} removed from wishlist`)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>

          {wishlistProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6">💔</div>
              <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start adding products to your wishlist by clicking the heart icon on any product card
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href="/products">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Wishlist Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{wishlistProducts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {wishlistProducts.filter((p) => p.stock > 0 && p.is_available !== false).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {wishlistProducts.filter((p) => p.stock === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Sold Out</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    Rp {wishlistProducts.reduce((total, p) => total + p.price, 0).toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </CardContent>
              </Card>
            </div>

            {/* Wishlist Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />

                  {/* Remove from wishlist button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromWishlist(product.id, product.name)}
                    className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 z-20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
