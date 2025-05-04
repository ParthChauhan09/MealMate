"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Star, ShoppingBag, ChevronLeft, Heart, Share2, MapPin, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

type Meal = {
  _id: string
  name: string
  description: string
  price: number
  image: string
  provider: {
    _id: string
    name: string
    profilePhoto?: string
    location: string
  }
  cuisine: string
  dietaryInfo: string[]
  ingredients: string[]
  averageRating: number
  reviewCount: number
}

type Review = {
  _id: string
  user: {
    _id: string
    name: string
    profilePhoto?: string
  }
  rating: number
  comment: string
  createdAt: string
  photos?: string[]
}

export default function MealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch(`/api/meals/${params.id}`)
        // const data = await response.json()
        // setMeal(data.data)

        // For demo purposes, using mock data
        setMeal({
          _id: params.id as string,
          name: "Homestyle Butter Chicken",
          description:
            "Tender chicken in a rich, creamy tomato sauce with aromatic spices. Made with fresh ingredients and authentic recipe passed down through generations.",
          price: 12.99,
          image: "/placeholder.svg?height=400&width=600",
          provider: {
            _id: "p1",
            name: "Spice Garden",
            profilePhoto: "/placeholder.svg?height=100&width=100",
            location: "123 Spice Lane, Flavortown",
          },
          cuisine: "Indian",
          dietaryInfo: ["Gluten-Free"],
          ingredients: ["Chicken", "Tomatoes", "Cream", "Butter", "Garam Masala", "Fenugreek", "Ginger", "Garlic"],
          averageRating: 4.8,
          reviewCount: 124,
        })

        // Fetch reviews
        // const reviewsResponse = await fetch(`/api/meals/${params.id}/reviews`)
        // const reviewsData = await reviewsResponse.json()
        // setReviews(reviewsData.data)

        // Mock reviews
        setReviews([
          {
            _id: "r1",
            user: {
              _id: "u1",
              name: "John Doe",
              profilePhoto: "/placeholder.svg?height=50&width=50",
            },
            rating: 5,
            comment:
              "This butter chicken is absolutely delicious! The sauce is rich and creamy, and the chicken is perfectly tender. Will definitely order again!",
            createdAt: "2023-05-15T12:00:00Z",
          },
          {
            _id: "r2",
            user: {
              _id: "u2",
              name: "Jane Smith",
              profilePhoto: "/placeholder.svg?height=50&width=50",
            },
            rating: 4,
            comment: "Very good flavor and portion size. The spice level was perfect for me. Would recommend!",
            createdAt: "2023-05-10T14:30:00Z",
            photos: ["/placeholder.svg?height=200&width=300"],
          },
          {
            _id: "r3",
            user: {
              _id: "u3",
              name: "Mike Johnson",
            },
            rating: 5,
            comment:
              "Authentic taste that reminds me of my trip to India. The provider was also very friendly and delivery was on time.",
            createdAt: "2023-05-05T09:15:00Z",
          },
        ])
      } catch (error) {
        console.error("Failed to fetch meal details:", error)
        toast({
          title: "Error",
          description: "Failed to load meal details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMealDetails()
  }, [params.id, toast])

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} x ${meal?.name} added to your cart`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col gap-8">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 animate-pulse rounded" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded" />
              <div className="h-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded" />
              <div className="h-12 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Meal not found</h2>
          <p className="text-gray-500 mb-4">The meal you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/meals">Browse Meals</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-8"
      >
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to meals
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl overflow-hidden"
          >
            <img
              src={meal.image || "/placeholder.svg"}
              alt={meal.name}
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                <Heart className="h-5 w-5 text-gray-700" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                <Share2 className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-500">{meal.cuisine}</Badge>
                {meal.dietaryInfo.map((info, i) => (
                  <Badge key={i} variant="outline">
                    {info}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold">{meal.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                <span className="font-medium">{meal.averageRating}</span>
                <span className="text-gray-500">({meal.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-gray-600">{meal.description}</p>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={meal.provider.profilePhoto || "/placeholder.svg"} alt={meal.provider.name} />
                <AvatarFallback>{meal.provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">By {meal.provider.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {meal.provider.location}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-amber-500">${meal.price.toFixed(2)}</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 h-12 text-base" onClick={handleAddToCart}>
                <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">About this meal</h3>
                <p className="text-gray-600 mb-6">{meal.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Cuisine</h4>
                    <p className="text-gray-600">{meal.cuisine}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Dietary Information</h4>
                    <div className="flex flex-wrap gap-1">
                      {meal.dietaryInfo.length > 0 ? (
                        meal.dietaryInfo.map((info, i) => (
                          <Badge key={i} variant="outline">
                            {info}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-600">No specific dietary information</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ingredients" className="pt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Customer Reviews</h3>
                  {user && (
                    <Button asChild className="bg-amber-500 hover:bg-amber-600">
                      <Link href={`/meals/${meal._id}/review`}>Write a Review</Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b pb-6 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={review.user.profilePhoto || "/placeholder.svg"}
                                alt={review.user.name}
                              />
                              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{review.comment}</p>
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {review.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo || "/placeholder.svg"}
                                alt={`Review photo ${index + 1}`}
                                className="h-24 w-auto rounded-md object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this meal!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
