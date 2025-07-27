"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface TestimonialFormProps {
  onSuccess: () => void
}

export function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    rating: 0,
    item_bought: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.item_bought || !formData.message || formData.rating === 0) {
      toast.error("Please fill in all fields and select a rating")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("testimonials").insert([
        {
          username: formData.username,
          rating: formData.rating,
          item_bought: formData.item_bought,
          message: formData.message,
          approved: false,
        },
      ])

      if (error) throw error

      toast.success("Testimonial submitted! It will be reviewed by admin.")
      setFormData({ username: "", rating: 0, item_bought: "", message: "" })
      onSuccess()
    } catch (error) {
      console.error("Error submitting testimonial:", error)
      toast.error("Failed to submit testimonial")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
        }`}
        onClick={() => setFormData({ ...formData, rating: i + 1 })}
      />
    ))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Testimonial</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Roblox Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Your Roblox username"
            />
          </div>

          <div>
            <Label>Rating</Label>
            <div className="flex space-x-1 mt-1">{renderStars()}</div>
          </div>

          <div>
            <Label htmlFor="item_bought">Item Bought</Label>
            <Input
              id="item_bought"
              value={formData.item_bought}
              onChange={(e) => setFormData({ ...formData, item_bought: e.target.value })}
              placeholder="What pet did you buy?"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Testimonial"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
