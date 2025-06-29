"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  ChefHat,
  Users,
  TrendingUp,
  Heart,
  ShoppingCart,
  ArrowRight,
  Play,
} from "lucide-react"

interface Meal {
  _id: string
  name: string
  description: string
  price: number
  category: string
  availability: boolean
  photo?: string
  provider: {
    _id: string
    name: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}



const stats = [
  { icon: ChefHat, label: "Home Chefs", value: "500+", color: "text-orange-500" },
  { icon: Users, label: "Happy Customers", value: "10K+", color: "text-blue-500" },
  { icon: TrendingUp, label: "Orders Delivered", value: "50K+", color: "text-green-500" },
]

export default function MealMatePage() {
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [likedMeals, setLikedMeals] = useState<string[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const categories = ["all", "breakfast", "lunch", "dinner", "snacks"]

  useEffect(() => {
    fetchFeaturedMeals()
  }, [])

  const fetchFeaturedMeals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals`)
      if (response.ok) {
        const data = await response.json()
        // Get first 6 available meals for featured section
        const availableMeals = data.data.filter((meal: Meal) => meal.availability).slice(0, 6)
        setMeals(availableMeals)
      }
    } catch (error) {
      console.error("Failed to fetch meals:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (mealId: string) => {
    setLikedMeals((prev) => (prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]))
  }

  const handleAddToCart = (meal: Meal) => {
    addToCart({
      _id: meal._id,
      name: meal.name,
      price: meal.price,
      category: meal.category,
      provider: meal.provider,
    })
  }

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch =
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || meal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">🍽️ Homemade with Love</Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Discover Authentic
                <br />
                <span className="text-yellow-300">Home Cooking</span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto">
              Connect with local home chefs and enjoy fresh, homemade meals delivered to your doorstep
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Order Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-orange-600 hover:bg-orange-50 hover:text-orange-600 transform hover:scale-105 transition-all duration-200"
              >
                Become a Chef
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 hidden lg:block">
              <motion.div variants={floatingVariants} animate="animate">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ChefHat className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
            <div className="absolute bottom-20 right-10 hidden lg:block">
              <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 1 }}>
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Heart className="w-10 h-10" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 ${stat.color}`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <motion.section
        className="py-12 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900"
            >
              Find Your Perfect Meal
            </motion.h2>

            <motion.div variants={itemVariants} className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for meals, cuisines, or chefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-orange-500 transition-colors duration-200"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize rounded-full transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-orange-500 hover:bg-orange-600 transform scale-105"
                      : "hover:bg-orange-50 hover:border-orange-300"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Meals Grid */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={selectedCategory + searchQuery}
            >
              {loading ? (
                <div className="col-span-full flex justify-center py-16">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                filteredMeals.map((meal, index) => (
                  <motion.div
                    key={meal._id}
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white h-full flex flex-col">
                      <div className="relative">
                        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
                          {meal.photo ? (
                            <img
                              src={meal.photo}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-6xl">🍽️</div>
                          )}
                        </div>
                        <motion.button
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
                          onClick={() => toggleLike(meal._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors duration-200 ${
                              likedMeals.includes(meal._id) ? "text-red-500 fill-red-500" : "text-gray-600"
                            }`}
                          />
                        </motion.button>
                        <Badge className="absolute top-4 left-4 bg-orange-500 text-white capitalize">{meal.category}</Badge>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{meal.name}</h3>
                          <span className="text-2xl font-bold text-orange-600 whitespace-nowrap">₹{meal.price}</span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{meal.description}</p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600">by {meal.provider.name}</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleAddToCart(meal)}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 w-full"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {!loading && filteredMeals.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No meals found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-orange-500 to-red-500 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Cooking?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
              Join our community of home chefs and start earning by sharing your delicious homemade meals
            </motion.p>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Become a Chef Partner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>


    </div>
  )
}
