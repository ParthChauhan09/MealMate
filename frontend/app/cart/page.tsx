"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart()
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const handleQuantityChange = (mealId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(mealId, newQuantity)
  }

  const placeOrdersFromCart = async () => {
    if (!token || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to place orders.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (user.role !== "customer") {
      toast({
        title: "Access denied",
        description: "Only customers can place orders.",
        variant: "destructive",
      })
      return
    }

    if (!user.address || user.address.trim().length === 0) {
      toast({
        title: "Address required",
        description: "Please update your profile with a delivery address before placing orders.",
        variant: "destructive",
      })
      router.push("/profile")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some meals to your cart first.",
        variant: "destructive",
      })
      return
    }

    setIsPlacingOrder(true)

    try {
      // Create separate orders for each cart item
      const orderPromises = cartItems.map(item =>
        fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meal: item._id,
            quantity: item.quantity,
            deliveryAddress: user.address,
            deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            specialInstructions: "",
          }),
        })
      )

      const responses = await Promise.all(orderPromises)
      
      // Check if all orders were successful
      const failedOrders = responses.filter(response => !response.ok)
      
      if (failedOrders.length === 0) {
        toast({
          title: "Orders placed successfully!",
          description: `${cartItems.length} order(s) have been placed.`,
        })
        clearCart()
        router.push("/orders")
      } else {
        throw new Error(`${failedOrders.length} order(s) failed to place`)
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Discover delicious homemade meals and add them to your cart!</p>
            <Button
              onClick={() => router.push("/meals")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Meals
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
              <p className="text-gray-600">{cartItems.length} item(s) in your cart</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-2xl">🍽️</div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">by {item.provider.name}</p>
                          <p className="text-sm text-orange-600 font-medium">₹{item.price}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{getTotalPrice()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={placeOrdersFromCart}
                      disabled={isPlacingOrder}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isPlacingOrder ? "Placing Orders..." : "Place Orders"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
