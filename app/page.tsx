import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { ProductGrid } from "@/components/product-grid"
import { TestimonialSection } from "@/components/testimonial-section"
import { RecentlyViewed } from "@/components/recently-viewed"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <Suspense fallback={<div className="h-32 bg-muted/30 animate-pulse" />}>
        <StatsSection />
      </Suspense>

      {/* Products Section */}
      <section id="products" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Premium Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of premium pets for your Roblox garden
            </p>
          </div>

          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="h-12 bg-muted animate-pulse rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-64 md:h-80 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            }
          >
            <ProductGrid />
          </Suspense>
        </div>
      </section>

      {/* Recently Viewed */}
      <div className="container mx-auto px-4">
        <RecentlyViewed />
      </div>

      {/* Testimonials Section */}
      <Suspense
        fallback={
          <section className="py-8 md:py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Customer Reviews</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <div className="bg-muted/30">
          <div className="container mx-auto px-4">
            <TestimonialSection />
          </div>
        </div>
      </Suspense>

      <Footer />
    </div>
  )
}
