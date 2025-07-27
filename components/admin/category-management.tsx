"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  created_at: string
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchCategories()
    }
  }, [])

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Categories fetch error:", error)
        toast.error("Failed to fetch categories: " + error.message)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Please enter category name")
      return
    }

    setLoading(true)

    try {
      const categoryData = { name: formData.name.trim() }

      console.log("Submitting category data:", categoryData)

      if (editingCategory) {
        const { data, error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id)
          .select()

        if (error) {
          console.error("Update error:", error)
          toast.error("Failed to update category: " + error.message)
          return
        }

        console.log("Update successful:", data)
        toast.success("Category updated successfully!")
      } else {
        const { data, error } = await supabase.from("categories").insert([categoryData]).select()

        if (error) {
          console.error("Insert error:", error)
          toast.error("Failed to add category: " + error.message)
          return
        }

        console.log("Insert successful:", data)
        toast.success("Category added successfully!")
      }

      // Reset form
      setFormData({ name: "" })
      setEditingCategory(null)
      setShowForm(false)

      // Refresh categories list
      await fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!confirm("Are you sure you want to delete this category? This will also delete all products in this category."))
      return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete category: " + error.message)
        return
      }

      toast.success("Category deleted successfully!")
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  const handleCancel = () => {
    setFormData({ name: "" })
    setEditingCategory(null)
    setShowForm(false)
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
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? "Edit Category" : "Add New Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categories List ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No categories found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4" />
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
