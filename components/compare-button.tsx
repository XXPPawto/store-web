"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { toast } from "sonner"

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

interface CompareButtonProps {
  product: Product
}

export function CompareButton({ product }: CompareButtonProps) {
  const [isInCompare, setIsInCompare] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]")
      setIsInCompare(compareList.some((p: Product) => p.id === product.id))
    }
  }, [product.id])

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (typeof window === "undefined") return

    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]")

    if (isInCompare) {
      const updated = compareList.filter((p: Product) => p.id !== product.id)
      localStorage.setItem("compareList", JSON.stringify(updated))
      setIsInCompare(false)
      toast.success(`${product.name} removed from comparison`)
    } else {
      if (compareList.length >= 4) {
        toast.error("Maximum 4 products can be compared")
        return
      }
      const updated = [...compareList, product]
      localStorage.setItem("compareList", JSON.stringify(updated))
      setIsInCompare(true)
      toast.success(`${product.name} added to comparison`)
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-12 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 w-8 h-8"
      >
        <BarChart3 className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleCompare}
      className={`absolute top-3 right-12 w-8 h-8 z-10 ${
        isInCompare
          ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800"
          : "bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
      }`}
    >
      <BarChart3 className={`h-4 w-4 ${isInCompare ? "text-emerald-600" : "text-gray-600 dark:text-gray-400"}`} />
    </Button>
  )
}
