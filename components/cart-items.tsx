"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCart()

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src={item.image_url || "/placeholder.svg?height=64&width=64&query=pet"}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
