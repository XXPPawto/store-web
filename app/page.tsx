import { Suspense } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { TestimonialSection } from "@/components/testimonial-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">XPawto Store</h1>
          <p className="text-xl text-muted-foreground mb-8">Premium Pets for Grow a Garden - Roblox</p>
        </div>

        <Suspense fallback={<div>Loading products...</div>}>
          <ProductGrid />
        </Suspense>

        <Suspense fallback={<div>Loading testimonials...</div>}>
          <TestimonialSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
