"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, Store, Home, Package, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { SearchDropdown } from "@/components/search-dropdown"

interface HeaderProps {
  onSearch?: (query: string) => void
  searchQuery?: string
  showSearch?: boolean
}

export function Header({ onSearch, searchQuery = "", showSearch = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {}

      window.addEventListener("storage", handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [])

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/testimonials", label: "Reviews", icon: MessageSquare },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Store className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base md:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    XPawto
                  </span>
                  <span className="text-xs text-muted-foreground hidden lg:block">Premium Pets</span>
                </div>
              </div>
            </Link>

            {/* Search Bar - Desktop Only */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <SearchDropdown onSearch={onSearch} searchQuery={searchQuery} placeholder="Search products..." />
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium hover:text-emerald-600 transition-colors relative group whitespace-nowrap flex items-center gap-1"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center bg-red-500">
                      {item.badge}
                    </Badge>
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Cart - Always Visible */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-emerald-50 dark:hover:bg-emerald-950 w-8 h-8 md:w-10 md:h-10"
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-xs flex items-center justify-center bg-emerald-600">
                      {itemCount > 99 ? "99+" : itemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-emerald-50 dark:hover:bg-emerald-950 w-8 h-8"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar - Below header when search is enabled */}
          {showSearch && (
            <div className="md:hidden py-3 border-t">
              <SearchDropdown onSearch={onSearch} searchQuery={searchQuery} placeholder="Search products..." />
            </div>
          )}

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4 animate-in slide-in-from-top-2">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium hover:text-emerald-600 transition-colors px-2 py-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
