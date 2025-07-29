"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"

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

export function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
      setRecentProducts(recent.slice(0, 4))
    }
  }, [])

  if (!mounted || recentProducts.length === 0) return null

  return (
    <section className="py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Recently Viewed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="scale-90">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
