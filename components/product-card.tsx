"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()

  // Check current quantity in cart
  const currentInCart = items.find((item) => item.id === product.id)?.quantity || 0
  const availableToAdd = product.stock - currentInCart
  const canAddToCart = product.is_available !== false && product.stock > 0 && availableToAdd > 0

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

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart!`)
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
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${!canAddToCart ? "opacity-90" : ""}`}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300&query=cute pet"}
            alt={product.name}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-2 right-2">{product.categories.name}</Badge>

          {/* Sold Out Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2 bg-red-600">
                SOLD OUT
              </Badge>
            </div>
          )}

          {/* Disabled Overlay */}
          {product.is_available === false && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-600">
                DISABLED
              </Badge>
            </div>
          )}

          {/* Max Reached Overlay */}
          {product.stock > 0 && product.is_available !== false && availableToAdd <= 0 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-orange-600">
                MAX REACHED
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-primary">Rp {product.price.toLocaleString("id-ID")}</span>
            <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
          </div>
          {currentInCart > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
              In cart: {currentInCart} | Available: {availableToAdd}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          variant={product.stock === 0 ? "destructive" : "default"}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
