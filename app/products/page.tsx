"use client"

import { useState } from "react"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} showSearch={true} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Products</h1>
          <p className="text-xl text-muted-foreground">Browse our complete collection of premium Roblox pets</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-64 md:h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <ProductGrid searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
