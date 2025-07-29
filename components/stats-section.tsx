"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalProducts}+</div>
              <div className="text-sm text-muted-foreground">Premium Pets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalTestimonials}+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.avgRating}⭐</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
