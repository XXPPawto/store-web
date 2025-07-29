"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "sonner"

interface WishlistButtonProps {
  productId: string
  productName: string
}

export function WishlistButton({ productId, productName }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setIsWishlisted(wishlist.includes(productId))
    }
  }, [productId])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (typeof window === "undefined") return

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

    if (isWishlisted) {
      const newWishlist = wishlist.filter((id: string) => id !== productId)
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsWishlisted(false)
      toast.success(`${productName} removed from wishlist`)
    } else {
      const newWishlist = [...wishlist, productId]
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsWishlisted(true)
      toast.success(`${productName} added to wishlist`)
    }

    // Dispatch custom event to update header counter
    window.dispatchEvent(new Event("wishlistUpdated"))
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 w-8 h-8"
      >
        <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleWishlist}
      className="absolute top-3 right-3 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 w-8 h-8 z-10"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-400"}`}
      />
    </Button>
  )
}
