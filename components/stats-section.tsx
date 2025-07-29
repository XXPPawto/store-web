"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/animated-counter"
import { supabase } from "@/lib/supabase"

export function StatsSection() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTestimonials: 0,
    totalCategories: 0,
    avgRating: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    if (!supabase) return

    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .neq("is_available", false)

      // Get testimonials count and average rating
      const { data: testimonials } = await supabase.from("testimonials").select("rating").eq("approved", true)

      // Get categories count
      const { count: categoriesCount } = await supabase.from("categories").select("*", { count: "exact", head: true })

      const avgRating = testimonials?.length
        ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
        : 0

      setStats({
        totalProducts: productsCount || 0,
        totalTestimonials: testimonials?.length || 0,
        totalCategories: categoriesCount || 0,
        avgRating: Math.round(avgRating * 10) / 10,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <section className="py-12 bg-muted/30 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/50 dark:to-teal-950/50" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in-up">Why Choose XPawto Store?</h2>
          <p className="text-muted-foreground animate-fade-in-up animation-delay-200">
            Trusted by thousands of Roblox players worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animation-delay-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter end={stats.totalProducts} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Premium Pets</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animation-delay-400">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter end={stats.totalTestimonials} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animation-delay-500">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter end={stats.totalCategories} />
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animation-delay-600">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter end={stats.avgRating * 10} suffix="⭐" />
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
