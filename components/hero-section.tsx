"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Zap, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 py-8 md:py-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 dark:bg-emerald-800 rounded-full blur-xl opacity-30" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200 dark:bg-teal-800 rounded-full blur-xl opacity-30" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-4 px-3 py-1 md:px-4 md:py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
          >
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Premium Roblox Pets Store
          </Badge>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            XPawto Store
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Premium Pets for <span className="font-semibold text-emerald-600">Grow a Garden</span> - Roblox Game
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex flex-col items-center p-3 md:p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center p-3 md:p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-500 mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">Trusted Service</span>
            </div>
            <div className="flex flex-col items-center p-3 md:p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-500 mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center p-3 md:p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">24/7 Support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button
              size="lg"
              className="px-6 py-3 md:px-8 text-base md:text-lg bg-emerald-600 hover:bg-emerald-700"
              asChild
            >
              <Link href="#products">Shop Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-3 md:px-8 text-base md:text-lg border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950 bg-transparent"
              asChild
            >
              <Link href="/testimonials">View Reviews</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
