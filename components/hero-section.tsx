"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Zap, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 py-12 md:py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 dark:bg-emerald-800 rounded-full blur-xl opacity-30 animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200 dark:bg-teal-800 rounded-full blur-xl opacity-30 animate-float animation-delay-300" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-200 dark:bg-cyan-800 rounded-full blur-xl opacity-20 animate-bounce-gentle" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 animate-fade-in-up"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Premium Roblox Pets Store
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
            XPawto Store
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
            Premium Pets for <span className="font-semibold text-emerald-600">Grow a Garden</span> - Roblox Game
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-in-up animation-delay-600">
            <div className="flex flex-col items-center p-4 md:p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 hover-lift">
              <Zap className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 mb-2 animate-bounce-gentle" />
              <span className="text-sm md:text-base font-medium">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center p-4 md:p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 hover-lift">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-green-500 mb-2 animate-bounce-gentle animation-delay-100" />
              <span className="text-sm md:text-base font-medium">Trusted Service</span>
            </div>
            <div className="flex flex-col items-center p-4 md:p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 hover-lift">
              <Star className="h-8 w-8 md:h-10 md:w-10 text-purple-500 mb-2 animate-bounce-gentle animation-delay-200" />
              <span className="text-sm md:text-base font-medium">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center p-4 md:p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 hover-lift">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-blue-500 mb-2 animate-bounce-gentle animation-delay-300" />
              <span className="text-sm md:text-base font-medium">24/7 Support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-800">
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-emerald-600 hover:bg-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link href="#products">Shop Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950 bg-transparent transform hover:scale-105 transition-all duration-300"
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
