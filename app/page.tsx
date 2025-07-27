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

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }
        >
          <ProductGrid />
        </Suspense>

        <Suspense
          fallback={
            <section className="py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Customer Testimonials</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </section>
          }
        >
          <TestimonialSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
