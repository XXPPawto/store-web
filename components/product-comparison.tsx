"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import Image from "next/image"

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

interface ProductComparisonProps {
  isOpen: boolean
  onClose: () => void
}

export function ProductComparison({ isOpen, onClose }: ProductComparisonProps) {
  const [compareList, setCompareList] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("compareList") || "[]")
      setCompareList(saved)
    }
  }, [isOpen])

  const removeFromCompare = (productId: string) => {
    if (typeof window === "undefined") return

    const updated = compareList.filter((p) => p.id !== productId)
    setCompareList(updated)
    localStorage.setItem("compareList", JSON.stringify(updated))
  }

  const clearAll = () => {
    if (typeof window === "undefined") return

    setCompareList([])
    localStorage.setItem("compareList", JSON.stringify([]))
  }

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Product Comparison</DialogTitle>
            {compareList.length > 0 && (
              <Button variant="outline" onClick={clearAll} size="sm">
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        {compareList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No products to compare</h3>
            <p className="text-muted-foreground">Add products to comparison from the product cards</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareList.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white dark:bg-gray-800/80"
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardContent className="p-4">
                  <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=200&width=200"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge className="bg-emerald-600">{product.categories.name}</Badge>
                    <div className="text-2xl font-bold text-emerald-600">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                          {product.stock > 0 ? `${product.stock} available` : "Sold out"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={product.is_available !== false ? "text-green-600" : "text-red-600"}>
                          {product.is_available !== false ? "Available" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {product.description || "Premium pet for your Roblox garden"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
