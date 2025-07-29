"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export function FloatingCart() {
  const { items } = useCart()
  const [isMinimized, setIsMinimized] = useState(false)

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 md:hidden">
      {isMinimized ? (
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center">
            {itemCount}
          </Badge>
        </Button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Cart ({itemCount})</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
              </div>
            ))}
            {items.length > 3 && <div className="text-xs text-muted-foreground">+{items.length - 3} more items</div>}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold mb-3">
              <span>Total:</span>
              <span className="text-emerald-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/cart">View Cart</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
