"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string
  stock: number
  is_available?: boolean
}

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCart()
  const [productStocks, setProductStocks] = useState<Record<string, Product>>({})

  useEffect(() => {
    fetchProductStocks()
  }, [items])

  const fetchProductStocks = async () => {
    if (!supabase || items.length === 0) return

    try {
      const productIds = items.map((item) => item.id)

      // Try to fetch with is_available column first
      let data, error

      try {
        const result = await supabase.from("products").select("id, stock, is_available").in("id", productIds)

        data = result.data
        error = result.error
      } catch (columnError) {
        // If is_available column doesn't exist, fetch without it
        const result = await supabase.from("products").select("id, stock").in("id", productIds)

        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Error fetching product stocks:", error)
        return
      }

      const stockMap = data?.reduce(
        (acc, product) => {
          acc[product.id] = {
            ...product,
            is_available: product.is_available ?? true, // Default to true if column doesn't exist
          }
          return acc
        },
        {} as Record<string, Product>,
      )

      setProductStocks(stockMap || {})
    } catch (error) {
      console.error("Error fetching product stocks:", error)
    }
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const product = productStocks[itemId]

    if (!product) {
      toast.error("Product information not available")
      return
    }

    if (product.is_available === false) {
      toast.error("This product is no longer available")
      removeItem(itemId)
      return
    }

    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`)
      updateQuantity(itemId, product.stock)
      return
    }

    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    updateQuantity(itemId, newQuantity)
  }

  const handleDirectInput = (itemId: string, value: string) => {
    const newQuantity = Number.parseInt(value) || 0
    handleQuantityChange(itemId, newQuantity)
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const product = productStocks[item.id]
        const maxQuantity = product?.stock || item.quantity
        const isAvailable = product?.is_available !== false

        return (
          <Card key={item.id} className={!isAvailable ? "opacity-75 border-red-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=64&width=64&query=pet"}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-center">
                      <span className="text-xs text-red-600 font-semibold">N/A</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
                  {product && (
                    <p className="text-xs text-muted-foreground">
                      {isAvailable ? `Stock: ${product.stock}` : "Not available"}
                    </p>
                  )}
                  {!isAvailable && (
                    <p className="text-xs text-red-500">
                      This item is no longer available and will be removed at checkout
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={!isAvailable}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={item.quantity}
                    onChange={(e) => handleDirectInput(item.id, e.target.value)}
                    className="w-16 text-center"
                    disabled={!isAvailable}
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={!isAvailable || item.quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-right">
                  <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
