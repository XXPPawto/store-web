"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, Copy, MessageCircle, Send, Facebook, Twitter } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
}

interface SocialShareProps {
  product: Product
}

export function SocialShare({ product }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/products?search=${encodeURIComponent(product.name)}` : ""
  const shareText = `Check out this amazing ${product.name} for only Rp ${product.price.toLocaleString("id-ID")} at XPawto Store! 🎮🐾`

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
        window.open(whatsappUrl, "_blank")
        toast.success("Shared to WhatsApp!")
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        window.open(telegramUrl, "_blank")
        toast.success("Shared to Telegram!")
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(facebookUrl, "_blank")
        toast.success("Shared to Facebook!")
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, "_blank")
        toast.success("Shared to Twitter!")
      },
    },
    {
      name: "Copy Link",
      icon: Copy,
      color: "bg-gray-500 hover:bg-gray-600",
      action: () => {
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        toast.success("Link copied to clipboard!")
      },
    },
  ]

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 w-8 h-8 shadow-md"
      >
        <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>

      {isOpen && (
        <>
          <Card className="absolute top-10 right-0 z-30 w-48 shadow-xl animate-slide-in-right">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Product
              </h4>
              <div className="space-y-2">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      option.action()
                      setIsOpen(false)
                    }}
                    className={`w-full justify-start text-white ${option.color}`}
                  >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}
