"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  User,
  Calendar
} from "lucide-react"

interface Meal {
  _id: string
  name: string
  description: string
  price: number
  category: string
  availability: boolean
  user: string
  provider: {
    _id: string
    name: string
    email: string
    profilePhoto?: string
  }
}



export default function MealDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()
  
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (params.id) {
      fetchMealDetails()
    }
  }, [params.id])

  const fetchMealDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setMeal(data.data)
      } else {
        toast({
          title: "Error",
          description: "Meal not found.",
          variant: "destructive",
        })
        router.push("/meals")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch meal details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  const orderMeal = async () => {
    if (!token || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to place an order.",
        variant: "destructive",
      })
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

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meal: meal?._id,
          quantity: 1,
          deliveryAddress: user.address,
          deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          specialInstructions: "",
        }),
      })

      if (response.ok) {
        toast({
          title: "Order placed successfully!",
          description: `Your order for ${meal?.name} has been placed.`,
        })
        router.push("/dashboard")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to place order")
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meal not found</h2>
          <Button onClick={() => router.push("/meals")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Meals
          </Button>
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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div>
              {/* Meal Details */}
              <Card className="mb-8">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center rounded-t-lg">
                    <div className="text-8xl">🍽️</div>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-orange-500 text-white capitalize">
                    {meal.category}
                  </Badge>
                  {meal.availability ? (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                      Unavailable
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{meal.name}</h1>
                    <span className="text-3xl font-bold text-orange-600">₹{meal.price}</span>
                  </div>

                  <p className="text-gray-600 mb-6 text-lg">{meal.description}</p>

                  {/* Provider Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{meal.provider.name}</h3>
                      <p className="text-sm text-gray-600">Chef & Provider</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={orderMeal}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={!meal.availability}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                    <Button variant="outline" className="px-6">
                      <Heart className="w-4 h-4" />
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
