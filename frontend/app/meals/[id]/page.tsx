"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${params.id}/reviews`)
      
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    }
  }

  const submitReview = async () => {
    if (!token || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a review.",
        variant: "destructive",
      })
      return
    }

    if (user.role !== "customer") {
      toast({
        title: "Access denied",
        description: "Only customers can submit reviews.",
        variant: "destructive",
      })
      return
    }

    setSubmittingReview(true)

    try {
      const formData = new FormData()
      formData.append("rating", rating.toString())
      formData.append("text", reviewText)

      const response = await fetch(`${API_BASE_URL}/meals/${params.id}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback.",
        })
        setReviewText("")
        setRating(5)
        fetchReviews() // Refresh reviews
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit review")
      }
    } catch (error) {
      toast({
        title: "Review failed",
        description: error instanceof Error ? error.message : "Failed to submit review.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
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
          deliveryAddress: user.address || "Default address",
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

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Meal Details */}
              <Card className="mb-8">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=400&width=800"
                    alt={meal.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
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

                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                      <span>({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>30 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>2.3 km</span>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <img
                      src={meal.provider.profilePhoto || "/placeholder-user.jpg"}
                      alt={meal.provider.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
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

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Review Form */}
                  {user && user.role === "customer" && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Write a Review</h4>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />

                      <Button
                        onClick={submitReview}
                        disabled={submittingReview || !reviewText.trim()}
                        className="w-full"
                        size="sm"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <img
                            src={review.user.profilePhoto || "/placeholder-user.jpg"}
                            alt={review.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{review.user.name}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Be the first to review this meal!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
