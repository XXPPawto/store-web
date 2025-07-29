"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Copy, Clock, Gift, TrendingUp } from "lucide-react"
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
  valid_until?: string
}

export function VoucherBanner() {
  const [featuredVouchers, setFeaturedVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedVouchers()

    // Refresh vouchers every 30 seconds to keep usage counts updated
    const interval = setInterval(fetchFeaturedVouchers, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchFeaturedVouchers = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order("discount_value", { ascending: false })
        .limit(3)

      if (error) {
        console.error("Error fetching vouchers:", error)
        setLoading(false)
        return
      }

      // Filter vouchers that haven't reached usage limit
      const availableVouchers = (data || []).filter(
        (voucher) => !voucher.usage_limit || voucher.used_count < voucher.usage_limit,
      )

      setFeaturedVouchers(availableVouchers)
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Voucher code "${code}" copied! Use it at checkout.`)
  }

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}%`
    }
    return `Rp ${voucher.discount_value.toLocaleString("id-ID")}`
  }

  const getTimeLeft = (validUntil: string) => {
    const now = new Date()
    const expiry = new Date(validUntil)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} days left`
    if (hours > 0) return `${hours} hours left`
    return "Expires soon"
  }

  const getUsagePercentage = (voucher: Voucher) => {
    if (!voucher.usage_limit) return 0
    return (voucher.used_count / voucher.usage_limit) * 100
  }

  const getRemainingUses = (voucher: Voucher) => {
    if (!voucher.usage_limit) return "Unlimited"
    const remaining = voucher.usage_limit - voucher.used_count
    return `${remaining} uses left`
  }

  if (loading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 animate-pulse rounded-lg" />
        </div>
      </section>
    )
  }

  if (featuredVouchers.length === 0) {
    return null
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-purple-600" />
            Special Vouchers
          </h2>
          <p className="text-muted-foreground">Save more with our exclusive discount codes!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredVouchers.map((voucher, index) => (
            <Card
              key={voucher.id}
              className={`relative overflow-hidden border-2 ${
                index === 0
                  ? "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
                  : index === 1
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950"
                    : "border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950"
              } hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket
                      className={`h-5 w-5 ${
                        index === 0 ? "text-purple-600" : index === 1 ? "text-emerald-600" : "text-orange-600"
                      }`}
                    />
                    <Badge
                      className={`${
                        index === 0
                          ? "bg-purple-600 hover:bg-purple-700"
                          : index === 1
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-orange-600 hover:bg-orange-700"
                      } text-white`}
                    >
                      {formatDiscount(voucher)} OFF
                    </Badge>
                  </div>
                  {voucher.valid_until && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getTimeLeft(voucher.valid_until)}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1">{voucher.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{voucher.description}</p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <code className="bg-white/70 dark:bg-gray-800/70 px-2 py-1 rounded text-sm font-mono font-bold">
                      {voucher.code}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => copyVoucherCode(voucher.code)}
                    className={`${
                      index === 0
                        ? "bg-purple-600 hover:bg-purple-700"
                        : index === 1
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-orange-600 hover:bg-orange-700"
                    } text-white`}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>

                {voucher.min_purchase > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Min purchase: Rp {voucher.min_purchase.toLocaleString("id-ID")}
                  </p>
                )}

                {/* Usage tracking */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-muted-foreground">Usage</span>
                    </div>
                    <span className="font-medium">{getRemainingUses(voucher)}</span>
                  </div>

                  {voucher.usage_limit && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {voucher.used_count}</span>
                        <span>Limit: {voucher.usage_limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === 0 ? "bg-purple-600" : index === 1 ? "bg-emerald-600" : "bg-orange-600"
                          }`}
                          style={{
                            width: `${Math.min(getUsagePercentage(voucher), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Decorative elements */}
              <div
                className={`absolute -top-2 -right-2 w-8 h-8 ${
                  index === 0 ? "bg-purple-200" : index === 1 ? "bg-emerald-200" : "bg-orange-200"
                } rounded-full opacity-50`}
              />
              <div
                className={`absolute -bottom-2 -left-2 w-6 h-6 ${
                  index === 0 ? "bg-pink-200" : index === 1 ? "bg-teal-200" : "bg-yellow-200"
                } rounded-full opacity-30`}
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
