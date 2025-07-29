"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Check, X, Percent, DollarSign, Sparkles } from "lucide-react"
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
  const [popularVouchers, setPopularVouchers] = useState<Voucher[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)

  useEffect(() => {
    fetchPopularVouchers()
  }, [])

  const fetchPopularVouchers = async () => {
    if (!supabase) {
      setLoadingPopular(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order("discount_value", { ascending: false })
        .limit(4)

      if (error) {
        console.error("Error fetching popular vouchers:", error)
        setLoadingPopular(false)
        return
      }

      // Filter vouchers that haven't reached usage limit
      const availableVouchers = (data || []).filter(
        (voucher) => !voucher.usage_limit || voucher.used_count < voucher.usage_limit,
      )

      setPopularVouchers(availableVouchers)
    } catch (error) {
      console.error("Error fetching popular vouchers:", error)
    } finally {
      setLoadingPopular(false)
    }
  }

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

  const updateVoucherUsage = async (voucherId: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { error } = await supabase
        .from("vouchers")
        .update({
          used_count: supabase.raw("used_count + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", voucherId)

      if (error) {
        console.error("Error updating voucher usage:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error updating voucher usage:", error)
      return false
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

  const handleApplyVoucher = async (code?: string) => {
    const codeToUse = code || voucherCode.trim()

    if (!codeToUse) {
      toast.error("Please enter a voucher code")
      return
    }

    setLoading(true)

    try {
      const validation = await validateVoucherCode(codeToUse)

      if (!validation.valid || !validation.voucher) {
        toast.error(validation.error || "Invalid voucher code")
        setLoading(false)
        return
      }

      const discount = calculateDiscount(validation.voucher, total)

      // Update voucher usage count
      const updateSuccess = await updateVoucherUsage(validation.voucher.id)

      if (!updateSuccess) {
        toast.error("Failed to apply voucher. Please try again.")
        setLoading(false)
        return
      }

      // Update the voucher object with incremented used_count for UI
      const updatedVoucher = {
        ...validation.voucher,
        used_count: validation.voucher.used_count + 1,
      }

      onVoucherApplied(updatedVoucher, discount)
      toast.success(`Voucher "${validation.voucher.code}" applied! You saved Rp ${discount.toLocaleString("id-ID")}`)
      setVoucherCode("")

      // Refresh popular vouchers to update usage counts
      await fetchPopularVouchers()
    } catch (error) {
      console.error("Error applying voucher:", error)
      toast.error("Failed to apply voucher")
    } finally {
      setLoading(false)
    }
  }

  // Separate validation function to avoid confusion
  const validateVoucherCode = async (code: string) => {
    return await validateVoucher(code)
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

  const getVoucherAvailability = (voucher: Voucher) => {
    if (!voucher.usage_limit) return "Unlimited"
    const remaining = voucher.usage_limit - voucher.used_count
    return `${remaining} left`
  }

  const isVoucherAvailable = (voucher: Voucher) => {
    if (!voucher.usage_limit) return true
    return voucher.used_count < voucher.usage_limit
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
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleApplyVoucher()
                  }
                }}
              />
              <Button onClick={() => handleApplyVoucher()} disabled={loading || !voucherCode.trim()}>
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h4 className="font-semibold text-sm">Popular Vouchers</h4>
          </div>

          {loadingPopular ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : popularVouchers.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {popularVouchers.map((voucher) => (
                <div key={voucher.id} className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoucherCode(voucher.code)}
                    className="text-xs h-8 w-full relative"
                    disabled={!!appliedVoucher || !isVoucherAvailable(voucher)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold">{voucher.code}</span>
                      <span className="text-xs text-muted-foreground">{getVoucherAvailability(voucher)}</span>
                    </div>
                  </Button>

                  {/* Usage indicator */}
                  {voucher.usage_limit && (
                    <div className="absolute -top-1 -right-1">
                      <Badge
                        variant="secondary"
                        className="text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center"
                      >
                        {voucher.usage_limit - voucher.used_count}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No vouchers available at the moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
