"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

type Meal = {
  _id: string
  name: string
  description: string
  price: number
  image: string
  provider: {
    _id: string
    name: string
  }
  cuisine: string
  dietaryInfo: string[]
  averageRating: number
  reviewCount: number
}

export default function FeaturedMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch("/api/meals?featured=true")
        // const data = await response.json()
        // setMeals(data.data)

        // For demo purposes, using mock data
        setMeals([
          {
            _id: "1",
            name: "Homestyle Butter Chicken",
            description: "Tender chicken in a rich, creamy tomato sauce with aromatic spices.",
            price: 12.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p1",
              name: "Spice Garden",
            },
            cuisine: "Indian",
            dietaryInfo: ["Gluten-Free"],
            averageRating: 4.8,
            reviewCount: 124,
          },
          {
            _id: "2",
            name: "Vegetable Biryani",
            description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
            price: 10.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p1",
              name: "Spice Garden",
            },
            cuisine: "Indian",
            dietaryInfo: ["Vegetarian", "Gluten-Free"],
            averageRating: 4.6,
            reviewCount: 98,
          },
          {
            _id: "3",
            name: "Homemade Lasagna",
            description: "Layers of pasta, rich meat sauce, and creamy cheese baked to perfection.",
            price: 14.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p2",
              name: "Mama's Kitchen",
            },
            cuisine: "Italian",
            dietaryInfo: [],
            averageRating: 4.9,
            reviewCount: 156,
          },
        ])
      } catch (error) {
        console.error("Failed to fetch meals:", error)
        toast({
          title: "Error",
          description: "Failed to load featured meals",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [toast])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {meals.map((meal, index) => (
        <motion.div
          key={meal._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={meal.image || "/placeholder.svg"} alt={meal.name} className="w-full h-48 object-cover" />
              <div className="absolute top-2 right-2">
                <Badge className="bg-amber-500">{meal.cuisine}</Badge>
              </div>
            </div>
            <CardContent className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{meal.name}</h3>
                <div className="text-amber-500 font-bold">${meal.price.toFixed(2)}</div>
              </div>
              <p className="text-gray-500 text-sm mb-3">{meal.description}</p>
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-medium">{meal.averageRating}</span>
                <span className="text-sm text-gray-500">({meal.reviewCount} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {meal.dietaryInfo.map((info, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {info}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>By {meal.provider.name}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/meals/${meal._id}`}>View Details</Link>
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
