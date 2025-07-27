"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartItems } from "@/components/cart-items"
import { CheckoutForm } from "@/components/checkout-form"
import { useCart } from "@/hooks/use-cart"

export default function CartPage() {
  const { items } = useCart()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            <div>
              <CheckoutForm total={total} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
