"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Testimonial {
  id: string
  username: string
  rating: number
  item_bought: string
  message: string
  approved: boolean
  created_at: string
}

export function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").update({ approved: true }).eq("id", id)

      if (error) throw error
      toast.success("Testimonial approved!")
      fetchTestimonials()
    } catch (error) {
      console.error("Error approving testimonial:", error)
      toast.error("Failed to approve testimonial")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").update({ approved: false }).eq("id", id)

      if (error) throw error
      toast.success("Testimonial rejected!")
      fetchTestimonials()
    } catch (error) {
      console.error("Error rejecting testimonial:", error)
      toast.error("Failed to reject testimonial")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonial Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Item Bought</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.username}</TableCell>
                  <TableCell>
                    <div className="flex">{renderStars(testimonial.rating)}</div>
                  </TableCell>
                  <TableCell>{testimonial.item_bought}</TableCell>
                  <TableCell className="max-w-xs truncate">{testimonial.message}</TableCell>
                  <TableCell>
                    <Badge variant={testimonial.approved ? "default" : "secondary"}>
                      {testimonial.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!testimonial.approved && (
                        <Button variant="outline" size="sm" onClick={() => handleApprove(testimonial.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {testimonial.approved && (
                        <Button variant="outline" size="sm" onClick={() => handleReject(testimonial.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
