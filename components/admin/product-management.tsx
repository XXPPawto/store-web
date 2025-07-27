"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  categories: {
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: "",
    category_id: "",
    stock: "",
    description: "",
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchProducts()
      fetchCategories()
    }
  }, [])

  const fetchProducts = async () => {
    if (!supabase) return

    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) {
        console.error("Products error:", productsError)
        toast.error("Failed to fetch products: " + productsError.message)
        return
      }

      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) {
        console.error("Categories error:", categoriesError)
        toast.error("Failed to fetch categories: " + categoriesError.message)
        return
      }

      const categoryMap =
        categoriesData?.reduce(
          (acc, category) => {
            acc[category.id] = category.name
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      const productsWithCategories =
        productsData?.map((product) => ({
          ...product,
          categories: {
            name: categoryMap[product.category_id] || "Unknown",
          },
        })) || []

      setProducts(productsWithCategories)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to fetch products")
    }
  }

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("categories").select("*")

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

    if (!formData.name || !formData.price || !formData.category_id || !formData.stock) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        image_url: formData.image_url || null,
        category_id: formData.category_id,
        stock: Number.parseInt(formData.stock),
        description: formData.description || null,
      }

      console.log("Submitting product data:", productData)

      if (editingProduct) {
        const { data, error } = await supabase.from("products").update(productData).eq("id", editingProduct.id).select()

        if (error) {
          console.error("Update error:", error)
          toast.error("Failed to update product: " + error.message)
          return
        }

        console.log("Update successful:", data)
        toast.success("Product updated successfully!")
      } else {
        const { data, error } = await supabase.from("products").insert([productData]).select()

        if (error) {
          console.error("Insert error:", error)
          toast.error("Failed to add product: " + error.message)
          return
        }

        console.log("Insert successful:", data)
        toast.success("Product added successfully!")
      }

      // Reset form
      setFormData({ name: "", price: "", image_url: "", category_id: "", stock: "", description: "" })
      setEditingProduct(null)
      setShowForm(false)

      // Refresh products list
      await fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id,
      stock: product.stock.toString(),
      description: product.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete product: " + error.message)
        return
      }

      toast.success("Product deleted successfully!")
      await fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", price: "", image_url: "", category_id: "", stock: "", description: "" })
    setEditingProduct(null)
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
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
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
          <CardTitle>Products List ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No products found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.categories.name}</Badge>
                    </TableCell>
                    <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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
