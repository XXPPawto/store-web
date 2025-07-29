"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Check, X, Percent, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"
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
  valid_until?: string
}

interface VoucherInputProps {
  total: number
  onVoucherApplied: (voucher: Voucher | null, discount: number) => void
  appliedVoucher: Voucher | null
}

export function VoucherInput({ total, onVoucherApplied, appliedVoucher }: VoucherInputProps) {
  const [voucherCode, setVoucherCode] = useState("")
  const [loading, setLoading] = useState(false)

  const validateVoucher = async (code: string): Promise<{ valid: boolean; voucher?: Voucher; error?: string }> => {
    if (!supabase) {
      return { valid: false, error: "Database connection not available" }
    }

    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single()

      if (error || !data) {
        return { valid: false, error: "Voucher code not found or inactive" }
      }

      const voucher = data as Voucher

      // Check if voucher is expired
      if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
        return { valid: false, error: "Voucher has expired" }
      }

      // Check usage limit
      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        return { valid: false, error: "Voucher usage limit reached" }
      }

      // Check minimum purchase
      if (voucher.min_purchase > 0 && total < voucher.min_purchase) {
        return {
          valid: false,
          error: `Minimum purchase of Rp ${voucher.min_purchase.toLocaleString("id-ID")} required`,
        }
      }

      return { valid: true, voucher }
    } catch (error) {
      console.error("Error validating voucher:", error)
      return { valid: false, error: "Failed to validate voucher" }
    }
  }

  const calculateDiscount = (voucher: Voucher, total: number): number => {
    if (voucher.discount_type === "percentage") {
      const discount = (total * voucher.discount_value) / 100
      return voucher.max_discount ? Math.min(discount, voucher.max_discount) : discount
    } else {
      return Math.min(voucher.discount_value, total)
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a voucher code")
      return
    }

    setLoading(true)

    try {
      const validation = await validateVoucher(voucherCode.trim())

      if (!validation.valid || !validation.voucher) {
        toast.error(validation.error || "Invalid voucher code")
        setLoading(false)
        return
      }

      const discount = calculateDiscount(validation.voucher, total)
      onVoucherApplied(validation.voucher, discount)
      toast.success(`Voucher "${validation.voucher.code}" applied! You saved Rp ${discount.toLocaleString("id-ID")}`)
      setVoucherCode("")
    } catch (error) {
      console.error("Error applying voucher:", error)
      toast.error("Failed to apply voucher")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveVoucher = () => {
    onVoucherApplied(null, 0)
    toast.success("Voucher removed")
  }

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}% OFF`
    }
    return `Rp ${voucher.discount_value.toLocaleString("id-ID")} OFF`
  }

  return (
    <div className="space-y-4">
      {/* Voucher Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Have a voucher code?</h3>
          </div>

          {!appliedVoucher ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleApplyVoucher} disabled={loading || !voucherCode.trim()}>
                {loading ? "Checking..." : "Apply"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <code className="font-mono font-semibold">{appliedVoucher.code}</code>
                  </div>
                  <Badge className="bg-emerald-600 hover:bg-emerald-700">
                    {appliedVoucher.discount_type === "percentage" ? (
                      <Percent className="h-3 w-3 mr-1" />
                    ) : (
                      <DollarSign className="h-3 w-3 mr-1" />
                    )}
                    {formatDiscount(appliedVoucher)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemoveVoucher}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm">
                <p className="font-medium text-emerald-600">{appliedVoucher.name}</p>
                {appliedVoucher.description && <p className="text-muted-foreground">{appliedVoucher.description}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Vouchers */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 text-sm">Popular Vouchers</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoucherCode("WELCOME10")}
              className="text-xs h-8"
              disabled={!!appliedVoucher}
            >
              WELCOME10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoucherCode("SAVE20K")}
              className="text-xs h-8"
              disabled={!!appliedVoucher}
            >
              SAVE20K
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoucherCode("STUDENT15")}
              className="text-xs h-8"
              disabled={!!appliedVoucher}
            >
              STUDENT15
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoucherCode("MEGA50")}
              className="text-xs h-8"
              disabled={!!appliedVoucher}
            >
              MEGA50
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
