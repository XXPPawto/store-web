"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Eye, Star, Zap, Shield, Award } from "lucide-react"
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

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const { addItem, items } = useCart()

  if (!product) return null

  const currentInCart = items.find((item) => item.id === product.id)?.quantity || 0
  const availableToAdd = product.stock - currentInCart
  const canAddToCart = product.is_available !== false && product.stock > 0 && availableToAdd > 0

  const features = [
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Delivered within 5-15 minutes",
      color: "text-yellow-500",
    },
    {
      icon: Shield,
      title: "Guaranteed Safe",
      description: "100% secure transaction",
      color: "text-green-500",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Top-tier Roblox pets",
      color: "text-purple-500",
    },
  ]

  const handleAddToCart = () => {
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

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      })
    }

    toast.success(`${quantity}x ${product.name} added to cart!`, {
      icon: "🛒",
    })
    onClose()
  }

  const getStockStatus = () => {
    if (product.is_available === false)
      return { label: "Disabled", variant: "secondary" as const, color: "text-gray-500" }
    if (product.stock === 0) return { label: "Sold Out", variant: "destructive" as const, color: "text-red-500" }
    if (product.stock <= 5)
      return { label: `Only ${product.stock} left!`, variant: "secondary" as const, color: "text-orange-500" }
    return { label: `${product.stock} in stock`, variant: "default" as const, color: "text-green-500" }
  }

  const stockStatus = getStockStatus()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600" />
            Quick View
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
              <Image
                src={product.image_url || "/placeholder.svg?height=400&width=400&query=cute pet"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Floating badges */}
              <Badge className="absolute top-4 left-4 bg-emerald-600 hover:bg-emerald-700">
                {product.categories.name}
              </Badge>

              {product.price > 100000 && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                  Premium
                </Badge>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedFeature === index ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950" : ""
                  }`}
                  onClick={() => setSelectedFeature(index)}
                >
                  <CardContent className="p-3 text-center">
                    <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
                    <p className="text-xs font-medium">{feature.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Feature Description */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {React.createElement(features[selectedFeature].icon, {
                    className: `h-5 w-5 ${features[selectedFeature].color}`,
                  })}
                  <h4 className="font-semibold">{features[selectedFeature].title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{features[selectedFeature].description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.9/5)</span>
                </div>
                <Badge variant={stockStatus.variant} className={stockStatus.color}>
                  {stockStatus.label}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ||
                  "Premium pet for your Roblox garden. High quality, fast delivery, and guaranteed satisfaction."}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-emerald-600">Rp {product.price.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">Rp {(product.price * quantity).toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {canAddToCart && (
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                    disabled={quantity >= availableToAdd}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">(Max: {availableToAdd})</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {canAddToCart ? `Add ${quantity} to Cart` : "Not Available"}
              </Button>

              {currentInCart > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  You already have {currentInCart} of this item in your cart
                </p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Category</p>
                <p>{product.categories.name}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Delivery</p>
                <p>5-15 minutes</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Payment</p>
                <p>Dana, Gopay, QRIS</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Support</p>
                <p>24/7 WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
