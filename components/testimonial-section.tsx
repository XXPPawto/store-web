"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus } from "lucide-react"
import { TestimonialForm } from "@/components/testimonial-form"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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
    if (typeof window !== "undefined") {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured")
        setLoading(false)
        return
      }
      fetchTestimonials()
    }
  }, [])

  const fetchTestimonials = async () => {
    if (!supabase) {
      setError("Supabase client is not available")
      setLoading(false)
      return
    }

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
          <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
          <p className="text-muted-foreground">What our customers say about us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
        <p className="text-muted-foreground mb-6">What our customers say about us</p>
        {isSupabaseConfigured && (
          <Button onClick={() => setShowForm(!showForm)} className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Hide Form" : "Write a Review"}
          </Button>
        )}
      </div>

      {showForm && isSupabaseConfigured && (
        <div className="mb-12">
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
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <span className="ml-2 text-sm text-muted-foreground">{testimonial.rating}/5</span>
                </div>
                <blockquote className="text-sm text-muted-foreground mb-4 italic">"{testimonial.message}"</blockquote>
                <div className="text-sm">
                  <p className="font-semibold">{testimonial.username}</p>
                  <p className="text-muted-foreground">Bought: {testimonial.item_bought}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testimonials.length === 0 && !error && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">Be the first to review our products!</p>
        </div>
      )}
    </section>
  )
}
