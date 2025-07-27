"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchTestimonials()
    }
  }, [])

  const fetchTestimonials = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Testimonials fetch error:", error)
        toast.error("Failed to fetch testimonials: " + error.message)
        return
      }

      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast.error("Failed to fetch testimonials")
    }
  }

  const handleApprove = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.from("testimonials").update({ approved: true }).eq("id", id).select()

      if (error) {
        console.error("Approve error:", error)
        toast.error("Failed to approve testimonial: " + error.message)
        return
      }

      console.log("Approve successful:", data)
      toast.success("Testimonial approved!")
      await fetchTestimonials()
    } catch (error) {
      console.error("Error approving testimonial:", error)
      toast.error("Failed to approve testimonial")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.from("testimonials").update({ approved: false }).eq("id", id).select()

      if (error) {
        console.error("Reject error:", error)
        toast.error("Failed to reject testimonial: " + error.message)
        return
      }

      console.log("Reject successful:", data)
      toast.success("Testimonial rejected!")
      await fetchTestimonials()
    } catch (error) {
      console.error("Error rejecting testimonial:", error)
      toast.error("Failed to reject testimonial")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete testimonial: " + error.message)
        return
      }

      toast.success("Testimonial deleted successfully!")
      await fetchTestimonials()
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast.error("Failed to delete testimonial")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Database connection not configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonial Management</h2>
        <Button onClick={fetchTestimonials} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials List ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No testimonials found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Item Bought</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={testimonial.message}>
                        {testimonial.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={testimonial.approved ? "default" : "secondary"}>
                        {testimonial.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(testimonial.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!testimonial.approved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(testimonial.id)}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(testimonial.id)}
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
