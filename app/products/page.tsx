import { Suspense } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Products</h1>
          <p className="text-xl text-muted-foreground">Browse our complete collection of premium Roblox pets</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <ProductGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
