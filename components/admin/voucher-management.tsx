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
import { Pencil, Trash2, Plus, Ticket, Copy, Calendar } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Voucher {
  id: string
  code: string
  name: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_purchase: number
  max_discount?: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  valid_from: string
  valid_until?: string
  created_at: string
}

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    usage_limit: "",
    valid_until: "",
    is_active: true,
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchVouchers()
    }
  }, [])

  const fetchVouchers = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("vouchers").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Vouchers fetch error:", error)
        toast.error("Failed to fetch vouchers: " + error.message)
        return
      }

      setVouchers(data || [])
    } catch (error) {
      console.error("Error fetching vouchers:", error)
      toast.error("Failed to fetch vouchers")
    }
  }

  const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code: result })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!formData.code || !formData.name || !formData.discount_value) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const voucherData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: Number.parseFloat(formData.discount_value),
        min_purchase: Number.parseFloat(formData.min_purchase) || 0,
        max_discount: formData.max_discount ? Number.parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? Number.parseInt(formData.usage_limit) : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        is_active: formData.is_active,
      }

      console.log("Submitting voucher data:", voucherData)

      if (editingVoucher) {
        const { data, error } = await supabase.from("vouchers").update(voucherData).eq("id", editingVoucher.id).select()

        if (error) {
          console.error("Update error:", error)
          toast.error("Failed to update voucher: " + error.message)
          return
        }

        console.log("Update successful:", data)
        toast.success("Voucher updated successfully!")
      } else {
        const { data, error } = await supabase.from("vouchers").insert([voucherData]).select()

        if (error) {
          console.error("Insert error:", error)
          toast.error("Failed to add voucher: " + error.message)
          return
        }

        console.log("Insert successful:", data)
        toast.success("Voucher added successfully!")
      }

      // Reset form
      setFormData({
        code: "",
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase: "",
        max_discount: "",
        usage_limit: "",
        valid_until: "",
        is_active: true,
      })
      setEditingVoucher(null)
      setShowForm(false)

      // Refresh vouchers list
      await fetchVouchers()
    } catch (error) {
      console.error("Error saving voucher:", error)
      toast.error("Failed to save voucher")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || "",
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value.toString(),
      min_purchase: voucher.min_purchase.toString(),
      max_discount: voucher.max_discount?.toString() || "",
      usage_limit: voucher.usage_limit?.toString() || "",
      valid_until: voucher.valid_until ? new Date(voucher.valid_until).toISOString().split("T")[0] : "",
      is_active: voucher.is_active,
    })
    setShowForm(true)
  }

  const handleToggleActive = async (voucherId: string, currentStatus: boolean) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("vouchers").update({ is_active: !currentStatus }).eq("id", voucherId)

      if (error) {
        console.error("Toggle error:", error)
        toast.error("Failed to update voucher status: " + error.message)
        return
      }

      toast.success(`Voucher ${!currentStatus ? "activated" : "deactivated"} successfully!`)
      await fetchVouchers()
    } catch (error) {
      console.error("Error toggling voucher:", error)
      toast.error("Failed to update voucher status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) {
      toast.error("Database connection not available")
      return
    }

    if (!confirm("Are you sure you want to delete this voucher?")) return

    try {
      const { error } = await supabase.from("vouchers").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete voucher: " + error.message)
        return
      }

      toast.success("Voucher deleted successfully!")
      await fetchVouchers()
    } catch (error) {
      console.error("Error deleting voucher:", error)
      toast.error("Failed to delete voucher")
    }
  }

  const handleCancel = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase: "",
      max_discount: "",
      usage_limit: "",
      valid_until: "",
      is_active: true,
    })
    setEditingVoucher(null)
    setShowForm(false)
  }

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Voucher code "${code}" copied to clipboard!`)
  }

  const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.is_active) return { label: "Inactive", variant: "secondary" as const }
    if (voucher.valid_until && new Date(voucher.valid_until) < new Date())
      return { label: "Expired", variant: "destructive" as const }
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit)
      return { label: "Used Up", variant: "destructive" as const }
    return { label: "Active", variant: "default" as const }
  }

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}%`
    }
    return `Rp ${voucher.discount_value.toLocaleString("id-ID")}`
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
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6 text-emerald-600" />
          Voucher Management
        </h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Voucher"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVoucher ? "Edit Voucher" : "Add New Voucher"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Voucher Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Enter voucher code"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateVoucherCode}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Voucher Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter voucher name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter voucher description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">
                    Discount Value * {formData.discount_type === "percentage" ? "(%)" : "(Rp)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "10" : "20000"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="min_purchase">Min Purchase (Rp)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_discount">Max Discount (Rp)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingVoucher ? "Update Voucher" : "Add Voucher"}
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
          <CardTitle>Vouchers List ({vouchers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No vouchers found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => {
                  const status = getVoucherStatus(voucher)
                  return (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                            {voucher.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyVoucherCode(voucher.code)}
                            className="h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{voucher.name}</p>
                          {voucher.description && (
                            <p className="text-xs text-muted-foreground">{voucher.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-emerald-600">{formatDiscount(voucher)}</p>
                          {voucher.min_purchase > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Min: Rp {voucher.min_purchase.toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {voucher.used_count} / {voucher.usage_limit || "∞"}
                          </p>
                          {voucher.usage_limit && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-emerald-600 h-1 rounded-full"
                                style={{
                                  width: `${Math.min((voucher.used_count / voucher.usage_limit) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {voucher.valid_until ? new Date(voucher.valid_until).toLocaleDateString("id-ID") : "No limit"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Switch
                            checked={voucher.is_active}
                            onCheckedChange={() => handleToggleActive(voucher.id, voucher.is_active)}
                            size="sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => handleEdit(voucher)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(voucher.id)}>
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
