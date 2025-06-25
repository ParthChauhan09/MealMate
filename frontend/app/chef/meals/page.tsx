"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChefHat,
  DollarSign,
  Package
} from "lucide-react"

interface Meal {
  _id: string
  name: string
  description: string
  price: number
  category: string
  availability: boolean
  user: string
  provider: string
}

const categories = ["breakfast", "lunch", "dinner", "snack", "beverage"]

export default function ChefMealsPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    availability: true
  })

  // Add state for image file and preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (user && token && user.role === "provider") {
      fetchMeals()
    }
  }, [user, token])

  const fetchMeals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter meals by current user (provider)
        const userMeals = data.data.filter((meal: Meal) => meal.user === user?._id)
        setMeals(userMeals)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch meals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      availability: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingMeal(null);
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (meal: Meal) => {
    setFormData({
      name: meal.name,
      description: meal.description,
      price: meal.price.toString(),
      category: meal.category,
      availability: meal.availability
    })
    setEditingMeal(meal)
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingMeal 
        ? `${API_BASE_URL}/meals/${editingMeal._id}`
        : `${API_BASE_URL}/meals`
      
      const method = editingMeal ? "PUT" : "POST"

      // Use FormData for file upload
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("category", formData.category);
      form.append("availability", String(formData.availability));
      if (imageFile) {
        form.append("mealPhoto", imageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (response.ok) {
        toast({
          title: editingMeal ? "Meal updated!" : "Meal created!",
          description: `${formData.name} has been ${editingMeal ? "updated" : "created"} successfully.`,
        })
        setIsDialogOpen(false)
        resetForm()
        fetchMeals()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save meal")
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save meal.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAvailability = async (meal: Meal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${meal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...meal,
          availability: !meal.availability
        }),
      })

      if (response.ok) {
        toast({
          title: "Availability updated",
          description: `${meal.name} is now ${!meal.availability ? "available" : "unavailable"}.`,
        })
        fetchMeals()
      } else {
        throw new Error("Failed to update availability")
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update meal availability.",
        variant: "destructive",
      })
    }
  }

  const deleteMeal = async (meal: Meal) => {
    if (!confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/meals/${meal._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Meal deleted",
          description: `${meal.name} has been deleted successfully.`,
        })
        fetchMeals()
      } else {
        throw new Error("Failed to delete meal")
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete meal.",
        variant: "destructive",
      })
    }
  }

  if (user?.role !== "provider") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only providers can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Meals</h1>
              <p className="text-gray-600">Manage your meal offerings</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Meal
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md" aria-describedby="meal-dialog-desc">
                <DialogHeader>
                  <DialogTitle>
                    {editingMeal ? "Edit Meal" : "Create New Meal"}
                  </DialogTitle>
                </DialogHeader>
                <p id="meal-dialog-desc" className="sr-only">
                  Fill out the form to create or edit a meal. All fields are required.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Meal Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter meal name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your meal"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="capitalize">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mealPhoto">Meal Image</Label>
                    <Input
                      id="mealPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={formData.availability}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="availability">Available for orders</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {submitting ? "Saving..." : (editingMeal ? "Update" : "Create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Meals</p>
                    <p className="text-2xl font-bold text-gray-900">{meals.length}</p>
                  </div>
                  <ChefHat className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {meals.filter(meal => meal.availability).length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{meals.length > 0 ? Math.round(meals.reduce((sum, meal) => sum + meal.price, 0) / meals.length) : 0}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meals Grid */}
          {meals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meals yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first meal offering!</p>
                <Button onClick={openCreateDialog} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Meal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal, index) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="relative">
                      {meal.photo ? (
                        <img
                          src={meal.photo}
                          alt={meal.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <div className="text-6xl">🍽️</div>
                        </div>
                      )}
                      <Badge
                        className={`absolute top-4 right-4 ${
                          meal.availability ? "bg-green-500" : "bg-red-500"
                        } text-white`}
                      >
                        {meal.availability ? "Available" : "Unavailable"}
                      </Badge>
                      <Badge className="absolute top-4 left-4 bg-orange-500 text-white capitalize">
                        {meal.category}
                      </Badge>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{meal.name}</h3>
                        <span className="text-xl font-bold text-orange-600 whitespace-nowrap">₹{meal.price}</span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{meal.description}</p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAvailability(meal)}
                          className="flex-1"
                        >
                          {meal.availability ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Show
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(meal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMeal(meal)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
