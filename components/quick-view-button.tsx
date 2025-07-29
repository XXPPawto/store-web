"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category_id: string
  stock: number
  description: string
  is_available?: boolean
  categories: {
    name: string
  }
}

interface QuickViewButtonProps {
  product: Product
  onQuickView: (product: Product) => void
}

export function QuickViewButton({ product, onQuickView }: QuickViewButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView(product)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="absolute top-3 right-3 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 w-8 h-8 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
    >
      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    </Button>
  )
}
