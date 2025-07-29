"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Clock, Zap } from "lucide-react"

interface FlashSale {
  id: string
  title: string
  discount: number
  endTime: Date
  isActive: boolean
}

export function FlashSaleTimer() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({})

  useEffect(() => {
    // Generate flash sales (in real app, this would come from API)
    const now = new Date()
    const sales: FlashSale[] = [
      {
        id: "daily",
        title: "Daily Flash Sale",
        discount: 25,
        endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours
        isActive: true,
      },
      {
        id: "weekend",
        title: "Weekend Special",
        discount: 30,
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
        isActive: new Date().getDay() === 0 || new Date().getDay() === 6, // Weekend only
      },
      {
        id: "mega",
        title: "Mega Sale",
        discount: 50,
        endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: Math.random() > 0.7, // Random mega sale
      },
    ]

    setFlashSales(sales.filter((sale) => sale.isActive))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: Record<string, string> = {}

      flashSales.forEach((sale) => {
        const now = new Date().getTime()
        const distance = sale.endTime.getTime() - now

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)

          newTimeLeft[sale.id] = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        } else {
          newTimeLeft[sale.id] = "EXPIRED"
        }
      })

      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [flashSales])

  if (flashSales.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {flashSales.map((sale) => (
        <Card
          key={sale.id}
          className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 border-red-200 dark:border-red-800 animate-pulse-slow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Flame className="h-8 w-8 text-red-500 animate-bounce" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {sale.title}
                    <Badge className="bg-red-500 hover:bg-red-600 text-white animate-bounce">
                      {sale.discount}% OFF
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">Limited time offer - Don't miss out!</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Ends in:</span>
                </div>
                <div className="font-mono text-2xl font-bold text-red-600 dark:text-red-400">
                  {timeLeft[sale.id] || "Loading..."}
                </div>
                <Button size="sm" className="mt-2 bg-red-500 hover:bg-red-600 text-white animate-pulse">
                  <Zap className="h-4 w-4 mr-1" />
                  Shop Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
