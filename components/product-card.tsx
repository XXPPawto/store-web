"use client"

import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { ShoppingCart, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { WishlistButton } from "@/components/wishlist-button"
import { CompareButton } from "@/components/compare-button"

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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [imageLoading, setImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const currentInCart = items.find((item) => item.id === product.id)?.quantity || 0
  const availableToAdd = product.stock - currentInCart
  const canAddToCart = product.is_available !== false && product.stock > 0 && availableToAdd > 0

  // Add to recently viewed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
      const filtered = recent.filter((p: Product) => p.id !== product.id)
      const updated = [product, ...filtered].slice(0, 10)
      localStorage.setItem("recentlyViewed", JSON.stringify(updated))
    }
  }, [product])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!canAddToCart) {
      if (product.is_available === false) {
        toast.error("This item is disabled")
      } else if (product.stock === 0) {
        toast.error("This item is sold out")
      } else if (availableToAdd <= 0) {
        toast.error("No more stock available")
      }
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart!`, {
      icon: "🛒",
    })
  }

  const getButtonText = () => {
    if (product.is_available === false) return "Disabled"
    if (product.stock === 0) return "Sold Out"
    if (availableToAdd <= 0) return "Max Reached"
    return "Add to Cart"
  }

  const getStockBadge = () => {
    if (product.is_available === false) return { label: "Disabled", variant: "secondary" as const }
    if (product.stock === 0) return { label: "Sold Out", variant: "destructive" as const }
    if (product.stock <= 5) return { label: `${product.stock} left`, variant: "secondary" as const }
    return { label: `Stock: ${product.stock}`, variant: "default" as const }
  }

  const stockBadge = getStockBadge()

  return (
    <Card
      className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
        !canAddToCart ? "opacity-90" : ""
      } animate-fade-in-up cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 animate-pulse" />
          )}
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300&query=cute pet"}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Category Badge with animation */}
          <Badge className="absolute top-3 left-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs animate-slide-in-left">
            {product.categories.name}
          </Badge>

          {/* Premium badge for expensive items */}
          {product.price > 100000 && (
            <Badge className="absolute top-3 left-3 mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs animate-bounce">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}

          {/* Action Buttons */}
          <div
            className={`absolute top-3 right-3 flex flex-col gap-1 transition-all duration-300 ${
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            }`}
          >
            <WishlistButton productId={product.id} productName={product.name} />
            <CompareButton product={product} />
          </div>

          {/* Stock Badge */}
          <Badge
            variant={stockBadge.variant}
            className={`absolute bottom-3 right-3 text-xs transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-80 translate-y-1"
            }`}
          >
            {stockBadge.label}
          </Badge>

          {/* Overlays for different states */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
              <Badge
                variant="destructive"
                className="text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 bg-red-600 animate-pulse"
              >
                SOLD OUT
              </Badge>
            </div>
          )}

          {product.is_available === false && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
              <Badge variant="secondary" className="text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 bg-gray-600">
                DISABLED
              </Badge>
            </div>
          )}

          {product.stock > 0 && product.is_available !== false && availableToAdd <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fade-in">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-orange-600">
                MAX REACHED
              </Badge>
            </div>
          )}

          {/* Hover overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        </div>

        <div className="p-3 md:p-4">
          <h3 className="font-semibold text-base md:text-lg lg:text-xl mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors duration-300">
            {product.name}
          </h3>

          <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2 h-6 md:h-8 lg:h-10">
            {product.description || "Premium pet for your Roblox garden"}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-600 animate-pulse">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              {currentInCart > 0 && (
                <span className="text-xs text-muted-foreground animate-fade-in">{currentInCart} in cart</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-0">
        <Button
          className={`w-full group-hover:shadow-lg transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 text-xs md:text-sm transform hover:scale-105 ${
            canAddToCart ? "animate-pulse-slow" : ""
          }`}
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          variant={product.stock === 0 ? "destructive" : "default"}
          size="sm"
        >
          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
