import { Suspense } from "react"
import { Header } from "@/components/header"
import { TestimonialSection } from "@/components/testimonial-section"
import { Footer } from "@/components/footer"

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Customer Testimonials</h1>
          <p className="text-xl text-muted-foreground">See what our customers say about XPawto Store</p>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }
        >
          <TestimonialSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
