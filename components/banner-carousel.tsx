"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import Link from "next/link"

interface Banner {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
  bgGradient: string
}

const banners: Banner[] = [
  {
    id: "1",
    title: "TOPUP ALL GAME",
    subtitle: "Premium Roblox Pets",
    description: "Get the best pets for your Grow a Garden adventure",
    image: "/images/banner-1.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
    bgGradient: "from-purple-600 via-violet-600 to-indigo-600",
  },
  {
    id: "2",
    title: "LEGENDARY PETS",
    subtitle: "Exclusive Collection",
    description: "Discover rare and powerful legendary pets",
    image: "/placeholder.svg?height=400&width=800",
    ctaText: "View Collection",
    ctaLink: "/products?category=legendary",
    bgGradient: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    id: "3",
    title: "FAST DELIVERY",
    subtitle: "24/7 Service",
    description: "Quick and reliable pet delivery service",
    image: "/placeholder.svg?height=400&width=800",
    ctaText: "Learn More",
    ctaLink: "/testimonials",
    bgGradient: "from-orange-600 via-red-600 to-pink-600",
  },
  {
    id: "4",
    title: "SPECIAL OFFERS",
    subtitle: "Limited Time",
    description: "Don't miss out on our exclusive deals",
    image: "/placeholder.svg?height=400&width=800",
    ctaText: "View Offers",
    ctaLink: "/products",
    bgGradient: "from-yellow-600 via-amber-600 to-orange-600",
  },
]

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isPlaying || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isPlaying, isHovered])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-2xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient} transition-all duration-1000 ease-in-out`}
      />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-white space-y-4 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-slide-in-left">
                  {currentBanner.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 animate-slide-in-left animation-delay-200">
                  {currentBanner.subtitle}
                </p>
              </div>

              <p className="text-base md:text-lg text-white/80 max-w-md animate-slide-in-left animation-delay-400">
                {currentBanner.description}
              </p>

              <div className="pt-4 animate-slide-in-left animation-delay-600">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Link href={currentBanner.ctaLink}>{currentBanner.ctaText}</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative h-48 md:h-64 lg:h-72 animate-fade-in-right">
              <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm animate-float">
                <Image
                  src={currentBanner.image || "/placeholder.svg"}
                  alt={currentBanner.title}
                  fill
                  className="object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  priority={currentIndex === 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{
            width: isPlaying && !isHovered ? "100%" : "0%",
            transitionDuration: isPlaying && !isHovered ? "5000ms" : "300ms",
          }}
        />
      </div>
    </div>
  )
}
