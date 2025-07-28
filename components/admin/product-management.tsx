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
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Plus, Upload, X } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  is_available?: boolean
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [hasAvailabilityColumn, setHasAvailabilityColumn] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: "",
    category_id: "",
    stock: "",
    description: "",
    is_available: true,
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      checkAvailabilityColumn()
      fetchProducts()
      fetchCategories()
    }
  }, [])

  const checkAvailabilityColumn = async () => {
    if (!supabase) return

    try {
      // Try to select is_available column to check if it exists
      const { error } = await supabase.from("products").select("is_available").limit(1)

      if (!error) {
        setHasAvailabilityColumn(true)
      } else {
        console.log("is_available column not found")
        setHasAvailabilityColumn(false)
      }
    } catch (error) {
      console.log("is_available column not found")
      setHasAvailabilityColumn(false)
    }
  }

  const fetchProducts = async () => {
    if (!supabase) return

    try {
      // Try to fetch with is_available column first
      let productsData, productsError

      try {
        const result = await supabase
          .from("products")
          .select("*, is_available")
          .order("created_at", { ascending: false })

        productsData = result.data
        productsError = result.error

        if (!productsError) {
          setHasAvailabilityColumn(true)
        }
      } catch (columnError) {
        // If is_available column doesn't exist, fetch without it
        const result = await supabase.from("products").select("*").order("created_at", { ascending: false })

        productsData = result.data
        productsError = result.error
        setHasAvailabilityColumn(false)
      }

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
          is_available: product.is_available ?? true, // Default to true if column doesn't exist
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setSelectedImage(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) throw new Error("Supabase not configured")

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return data.publicUrl
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
      let imageUrl = formData.image_url

      if (selectedImage) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadImage(selectedImage)
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          toast.error("Failed to upload image. Using placeholder instead.")
          imageUrl = "/placeholder.svg?height=300&width=300"
        } finally {
          setUploadingImage(false)
        }
      }

      const baseProductData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        image_url: imageUrl || "/placeholder.svg?height=300&width=300",
        category_id: formData.category_id,
        stock: Number.parseInt(formData.stock),
        description: formData.description || null,
      }

      // Only include is_available if the column exists
      const productData = hasAvailabilityColumn
        ? { ...baseProductData, is_available: formData.is_available }
        : baseProductData

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

      setFormData({
        name: "",
        price: "",
        image_url: "",
        category_id: "",
        stock: "",
        description: "",
        is_available: true,
      })
      setSelectedImage(null)
      setImagePreview("")
      setEditingProduct(null)
      setShowForm(false)

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
      is_available: product.is_available ?? true,
    })
    setImagePreview(product.image_url || "")
    setSelectedImage(null)
    setShowForm(true)
  }

  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId)

      if (error) {
        console.error("Stock update error:", error)
        toast.error("Failed to update stock: " + error.message)
        return
      }

      toast.success("Stock updated successfully!")
      await fetchProducts()
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error("Failed to update stock")
    }
  }

  const handleAvailabilityToggle = async (productId: string, currentAvailability: boolean) => {
    if (!supabase || !hasAvailabilityColumn) {
      toast.error("Availability feature not available. Please add the is_available column to your database.")
      return
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !currentAvailability })
        .eq("id", productId)

      if (error) {
        console.error("Availability update error:", error)
        toast.error("Failed to update availability: " + error.message)
        return
      }

      toast.success(`Product ${!currentAvailability ? "enabled" : "disabled"} successfully!`)
      await fetchProducts()
    } catch (error) {
      console.error("Error updating availability:", error)
      toast.error("Failed to update availability")
    }
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
    setFormData({ name: "", price: "", image_url: "", category_id: "", stock: "", description: "", is_available: true })
    setSelectedImage(null)
    setImagePreview("")
    setEditingProduct(null)
    setShowForm(false)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    setFormData({ ...formData, image_url: "" })
  }

  const getStockStatus = (stock: number, isAvailable?: boolean) => {
    if (hasAvailabilityColumn && isAvailable === false) return { label: "Disabled", variant: "secondary" as const }
    if (stock === 0) return { label: "Sold Out", variant: "destructive" as const }
    if (stock <= 5) return { label: `Low Stock (${stock})`, variant: "secondary" as const }
    return { label: `In Stock (${stock})`, variant: "default" as const }
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

      {/* !hasAvailabilityColumn && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> To enable product availability controls, run this SQL command in your Supabase
              dashboard:
              <br />
              <code className="bg-yellow-100 px-2 py-1 rounded mt-2 inline-block">
                ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT true;
              </code>
            </p>
          </CardContent>
        </Card>
      ) */}

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
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>
              </div>

              {/* Availability Toggle - only show if column exists */}
              {hasAvailabilityColumn && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="is_available">Product Available for Sale</Label>
                </div>
              )}

              {/* Image Upload Section */}
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-2 space-y-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Select Image"}
                    </Button>
                    <span className="text-sm text-muted-foreground">Max 5MB, JPG/PNG/GIF</span>
                  </div>
                </div>
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
                <Button type="submit" disabled={loading || uploadingImage}>
                  {loading
                    ? "Saving..."
                    : uploadingImage
                      ? "Uploading..."
                      : editingProduct
                        ? "Update Product"
                        : "Add Product"}
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
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  {hasAvailabilityColumn && <TableHead>Available</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.is_available)
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={product.image_url || "/placeholder.svg?height=48&width=48&query=pet"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.categories.name}</Badge>
                      </TableCell>
                      <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => {
                              const newStock = Number.parseInt(e.target.value) || 0
                              handleQuickStockUpdate(product.id, newStock)
                            }}
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </TableCell>
                      {hasAvailabilityColumn && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={product.is_available ?? true}
                              onCheckedChange={() => handleAvailabilityToggle(product.id, product.is_available ?? true)}
                              size="sm"
                            />
                            <span className="text-xs text-muted-foreground">
                              {product.is_available !== false ? "Yes" : "No"}
                            </span>
                          </div>
                        </TableCell>
                      )}
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
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
