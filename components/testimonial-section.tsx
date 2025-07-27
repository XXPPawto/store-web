"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { TestimonialForm } from "@/components/testimonial-form"
import { supabase } from "@/lib/supabase"

interface Testimonial {
  id: string
  username: string
  rating: number
  item_bought: string
  message: string
  created_at: string
}

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch data on client side
    if (typeof window !== "undefined") {
      fetchTestimonials()
    }
  }, [])

  const fetchTestimonials = async () => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      setError("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
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
    )
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Customer Testimonials</h2>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Hide Form" : "Write a Review"}</Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <TestimonialForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{testimonial.message}"</p>
                <div className="text-sm">
                  <p className="font-semibold">{testimonial.username}</p>
                  <p className="text-muted-foreground">Bought: {testimonial.item_bought}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testimonials.length === 0 && !error && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No testimonials yet. Be the first to review!</p>
        </div>
      )}
    </section>
  )
}
