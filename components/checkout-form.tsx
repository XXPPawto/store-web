"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { VoucherInput } from "@/components/voucher-input"

interface CheckoutFormProps {
  total: number
}

export function CheckoutForm({ total }: CheckoutFormProps) {
  const { items, clearCart } = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    robloxUsername: "",
    whatsapp: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [discount, setDiscount] = useState(0)

  const paymentMethods = [
    { id: "dana", name: "Dana" },
    { id: "gopay", name: "Gopay" },
    { id: "shopeepay", name: "Shopee Pay" },
    { id: "seabank", name: "Sea Bank" },
    { id: "qris", name: "QRIS" },
  ]

  const finalTotal = Math.max(0, total - discount)

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.robloxUsername || !customerInfo.whatsapp || !paymentMethod) {
      toast.error("Please fill in all fields")
      return
    }

    const orderDetails = items
      .map((item) => `${item.name} x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`)
      .join("\n")

    const message = `🛒 *New Order - XPawto Store*

👤 *Customer Info:*
Name: ${customerInfo.name}
Roblox Username: ${customerInfo.robloxUsername}
WhatsApp: ${customerInfo.whatsapp}

📦 *Order Details:*
${orderDetails}

💰 *Subtotal: Rp ${total.toLocaleString("id-ID")}*
${discount > 0 ? `🎫 *Discount (${appliedVoucher?.code}): -Rp ${discount.toLocaleString("id-ID")}*\n` : ""}💳 *Total: Rp ${finalTotal.toLocaleString("id-ID")}*
💳 *Payment Method: ${paymentMethods.find((p) => p.id === paymentMethod)?.name}*

Please confirm this order and provide payment instructions.`

    const whatsappUrl = `https://wa.me/6285128048534?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")
    clearCart()
    toast.success("Order sent to WhatsApp!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div>
          <Label htmlFor="robloxUsername">Roblox Username</Label>
          <Input
            id="robloxUsername"
            value={customerInfo.robloxUsername}
            onChange={(e) => setCustomerInfo({ ...customerInfo, robloxUsername: e.target.value })}
            placeholder="Your Roblox username"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={customerInfo.whatsapp}
            onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <VoucherInput
          total={total}
          onVoucherApplied={(voucher, discountAmount) => {
            setAppliedVoucher(voucher)
            setDiscount(discountAmount)
          }}
          appliedVoucher={appliedVoucher}
        />

        <div>
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id}>{method.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>Discount ({appliedVoucher?.code}):</span>
                <span>-Rp {discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-emerald-600">Rp {finalTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <Button onClick={handleCheckout} className="w-full mt-4" size="lg">
            Checkout via WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
