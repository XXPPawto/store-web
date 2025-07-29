"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Bot, Phone } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  text: string
  sender: "user" | "admin"
  timestamp: Date
  type?: "text" | "quick-reply"
}

const quickReplies = [
  "Harga produk?",
  "Cara pembayaran?",
  "Berapa lama delivery?",
  "Stock tersedia?",
  "Promo hari ini?",
]

const autoReplies = [
  {
    keywords: ["harga", "price", "berapa"],
    response: "Harga produk bervariasi mulai dari Rp 15.000 - Rp 150.000. Silakan cek katalog untuk detail harga! 💰",
  },
  {
    keywords: ["pembayaran", "bayar", "payment"],
    response: "Kami menerima Dana, Gopay, Shopee Pay, Sea Bank, dan QRIS. Pembayaran mudah dan aman! 💳",
  },
  {
    keywords: ["delivery", "kirim", "pengiriman"],
    response: "Delivery biasanya 5-15 menit setelah pembayaran konfirmasi. Fast delivery guaranteed! ⚡",
  },
  {
    keywords: ["stock", "stok", "tersedia"],
    response: "Stock selalu update real-time di website. Jika bisa add to cart berarti ready stock! ✅",
  },
  {
    keywords: ["promo", "diskon", "sale"],
    response: "Cek flash sale di homepage! Ada promo spesial setiap hari dengan diskon hingga 30%! 🔥",
  },
  {
    keywords: ["halo", "hai", "hello", "hi"],
    response: "Halo! Selamat datang di XPawto Store! 👋 Ada yang bisa saya bantu hari ini?",
  },
]

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Halo! Selamat datang di XPawto Store! 👋 Saya siap membantu Anda. Ada yang ingin ditanyakan?",
        sender: "admin",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender === "admin") {
        setUnreadCount((prev) => prev + 1)
      }
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getAutoReply = (text: string): string | null => {
    const lowerText = text.toLowerCase()
    for (const reply of autoReplies) {
      if (reply.keywords.some((keyword) => lowerText.includes(keyword))) {
        return reply.response
      }
    }
    return "Terima kasih atas pertanyaannya! Tim support kami akan segera membalas. Untuk respon lebih cepat, hubungi WhatsApp: 0851-2804-8534 📱"
  }

  const sendMessage = (text: string, type: "text" | "quick-reply" = "text") => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
      type,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")

    // Simulate typing
    setIsTyping(true)
    setTimeout(
      () => {
        const autoReply = getAutoReply(text)
        const adminMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: autoReply,
          sender: "admin",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, adminMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply, "quick-reply")
  }

  const openWhatsApp = () => {
    const message = "Halo, saya ingin bertanya tentang produk XPawto Store"
    const whatsappUrl = `https://wa.me/6285128048534?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    toast.success("Redirecting to WhatsApp...")
  }

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-gentle"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <Card className="w-80 h-96 shadow-2xl animate-slide-in-right">
            <CardHeader className="bg-emerald-600 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">XPawto Support</CardTitle>
                    <p className="text-xs text-emerald-100">Online - Siap membantu!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 w-8 h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.sender === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                      } ${message.type === "quick-reply" ? "bg-emerald-500" : ""}`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length <= 2 && (
                <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick replies:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs h-6 px-2"
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={openWhatsApp}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 h-8 text-sm"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8" disabled={isTyping || !inputText.trim()}>
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
