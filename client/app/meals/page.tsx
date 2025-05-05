"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Clock, ShoppingBag, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popularity")
  const { toast } = useToast()
  const router = useRouter()

  const cuisines = ["Indian", "Italian", "Chinese", "Mexican", "Thai", "American"]
  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free"]

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        // In a real app, we would fetch from the API with filters
        // const response = await fetch(`/api/meals?search=${searchTerm}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}...`)
        // const data = await response.json()
        // setMeals(data.data)

        // For demo purposes, using mock data
        const mockMeals = [
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
          {
            _id: "4",
            name: "Pad Thai",
            description: "Stir-fried rice noodles with eggs, tofu, bean sprouts, and peanuts.",
            price: 11.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p3",
              name: "Thai Delight",
            },
            cuisine: "Thai",
            dietaryInfo: ["Gluten-Free", "Nut-Free"],
            averageRating: 4.7,
            reviewCount: 87,
          },
          {
            _id: "5",
            name: "Vegan Buddha Bowl",
            description: "A nourishing bowl of grains, roasted vegetables, and tahini dressing.",
            price: 13.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p4",
              name: "Green Plate",
            },
            cuisine: "American",
            dietaryInfo: ["Vegan", "Gluten-Free", "Dairy-Free"],
            averageRating: 4.5,
            reviewCount: 76,
          },
          {
            _id: "6",
            name: "Chicken Enchiladas",
            description: "Corn tortillas filled with chicken, covered in chili sauce and cheese.",
            price: 15.99,
            image: "/placeholder.svg?height=200&width=300",
            provider: {
              _id: "p5",
              name: "Casa Mexicana",
            },
            cuisine: "Mexican",
            dietaryInfo: [],
            averageRating: 4.8,
            reviewCount: 112,
          },
        ]

        // Apply filters
        const filteredMeals = mockMeals.filter((meal) => {
          // Search term filter
          if (
            searchTerm &&
            !meal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !meal.description.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return false
          }

          // Price range filter
          if (meal.price < priceRange[0] || meal.price > priceRange[1]) {
            return false
          }

          // Cuisine filter
          if (selectedCuisines.length > 0 && !selectedCuisines.includes(meal.cuisine)) {
            return false
          }

          // Dietary filter
          if (selectedDietary.length > 0 && !selectedDietary.some((diet) => meal.dietaryInfo.includes(diet))) {
            return false
          }

          return true
        })

        // Sort meals
        if (sortBy === "price-low") {
          filteredMeals.sort((a, b) => a.price - b.price)
        } else if (sortBy === "price-high") {
          filteredMeals.sort((a, b) => b.price - a.price)
        } else if (sortBy === "rating") {
          filteredMeals.sort((a, b) => b.averageRating - a.averageRating)
        } else {
          // Default: popularity (by review count)
          filteredMeals.sort((a, b) => b.reviewCount - a.reviewCount)
        }

        setMeals(filteredMeals)
      } catch (error) {
        console.error("Failed to fetch meals:", error)
        toast({
          title: "Error",
          description: "Failed to load meals",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [searchTerm, priceRange, selectedCuisines, selectedDietary, sortBy, toast])

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisines((prev) => (prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]))
  }

  const handleDietaryChange = (option: string) => {
    setSelectedDietary((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]))
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Browse Meals</h1>
          <p className="text-gray-500">Discover delicious homemade meals from local providers</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Mobile */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="filters">
                <AccordionTrigger className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <h3 className="font-medium mb-2">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0, 50]}
                          max={50}
                          step={1}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cuisine */}
                    <div>
                      <h3 className="font-medium mb-2">Cuisine</h3>
                      <div className="space-y-2">
                        {cuisines.map((cuisine) => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cuisine-${cuisine}`}
                              checked={selectedCuisines.includes(cuisine)}
                              onCheckedChange={() => handleCuisineChange(cuisine)}
                            />
                            <label
                              htmlFor={`cuisine-${cuisine}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {cuisine}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <h3 className="font-medium mb-2">Dietary Preferences</h3>
                      <div className="space-y-2">
                        {dietaryOptions.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dietary-${option}`}
                              checked={selectedDietary.includes(option)}
                              onCheckedChange={() => handleDietaryChange(option)}
                            />
                            <label
                              htmlFor={`dietary-${option}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <Slider defaultValue={[0, 50]} max={50} step={1} value={priceRange} onValueChange={setPriceRange} />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Cuisine</h3>
              <div className="space-y-2">
                {cuisines.map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-desktop-${cuisine}`}
                      checked={selectedCuisines.includes(cuisine)}
                      onCheckedChange={() => handleCuisineChange(cuisine)}
                    />
                    <label
                      htmlFor={`cuisine-desktop-${cuisine}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Dietary Preferences</h3>
              <div className="space-y-2">
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dietary-desktop-${option}`}
                      checked={selectedDietary.includes(option)}
                      onCheckedChange={() => handleDietaryChange(option)}
                    />
                    <label
                      htmlFor={`dietary-desktop-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
            ) : meals.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No meals found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setPriceRange([0, 50])
                    setSelectedCuisines([])
                    setSelectedDietary([])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {meals.map((meal, index) => (
                  <motion.div
                    key={meal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={meal.image || "/placeholder.svg"}
                          alt={meal.name}
                          className="w-full h-48 object-cover"
                        />
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
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
