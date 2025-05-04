"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ShoppingBag, Calendar, ChevronRight, Star } from "lucide-react"
import Link from "next/link"

type Order = {
  _id: string
  meals: {
    meal: {
      _id: string
      name: string
      image: string
      price: number
      provider: {
        _id: string
        name: string
      }
    }
    quantity: number
  }[]
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  totalAmount: number
  createdAt: string
  deliveryTime?: string
  hasReviewed: boolean
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchOrders = async () => {
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch("/api/orders")
        // const data = await response.json()
        // setOrders(data.data)

        // For demo purposes, using mock data
        setOrders([
          {
            _id: "o1",
            meals: [
              {
                meal: {
                  _id: "m1",
                  name: "Homestyle Butter Chicken",
                  image: "/placeholder.svg?height=100&width=150",
                  price: 12.99,
                  provider: {
                    _id: "p1",
                    name: "Spice Garden",
                  },
                },
                quantity: 2,
              },
              {
                meal: {
                  _id: "m2",
                  name: "Vegetable Biryani",
                  image: "/placeholder.svg?height=100&width=150",
                  price: 10.99,
                  provider: {
                    _id: "p1",
                    name: "Spice Garden",
                  },
                },
                quantity: 1,
              },
            ],
            status: "delivered",
            totalAmount: 36.97,
            createdAt: "2023-05-15T12:00:00Z",
            deliveryTime: "2023-05-15T13:30:00Z",
            hasReviewed: false,
          },
          {
            _id: "o2",
            meals: [
              {
                meal: {
                  _id: "m3",
                  name: "Homemade Lasagna",
                  image: "/placeholder.svg?height=100&width=150",
                  price: 14.99,
                  provider: {
                    _id: "p2",
                    name: "Mama's Kitchen",
                  },
                },
                quantity: 1,
              },
            ],
            status: "confirmed",
            totalAmount: 14.99,
            createdAt: "2023-05-20T15:00:00Z",
            hasReviewed: false,
          },
          {
            _id: "o3",
            meals: [
              {
                meal: {
                  _id: "m4",
                  name: "Pad Thai",
                  image: "/placeholder.svg?height=100&width=150",
                  price: 11.99,
                  provider: {
                    _id: "p3",
                    name: "Thai Delight",
                  },
                },
                quantity: 2,
              },
            ],
            status: "pending",
            totalAmount: 23.98,
            createdAt: "2023-05-22T10:00:00Z",
            hasReviewed: false,
          },
        ])
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, router, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "preparing":
        return "bg-purple-500"
      case "ready":
        return "bg-green-500"
      case "delivered":
        return "bg-green-700"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => {
          if (activeTab === "active") {
            return ["pending", "confirmed", "preparing", "ready"].includes(order.status)
          } else if (activeTab === "completed") {
            return order.status === "delivered"
          } else if (activeTab === "cancelled") {
            return order.status === "cancelled"
          }
          return true
        })

  return (
    <div className="container px-4 md:px-6 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-8"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">My Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-2" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-16 bg-gray-200 animate-pulse rounded mb-4" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600">
                  <Link href="/meals">Browse Meals</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order._id.slice(-6)}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {order.meals.map((item, i) => (
                            <div key={i} className="flex gap-4">
                              <img
                                src={item.meal.image || "/placeholder.svg"}
                                alt={item.meal.name}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{item.meal.name}</h4>
                                <p className="text-sm text-gray-500">By {item.meal.provider.name}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-sm">
                                    ${item.meal.price.toFixed(2)} x {item.quantity}
                                  </p>
                                  <p className="font-medium">${(item.meal.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Amount</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                        {order.status === "delivered" && !order.hasReviewed && (
                          <Button asChild className="bg-amber-500 hover:bg-amber-600">
                            <Link href={`/meals/${order.meals[0].meal._id}/review`}>
                              <Star className="h-4 w-4 mr-2" /> Leave a Review
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline">
                          <Link href={`/orders/${order._id}`}>
                            View Details <ChevronRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                        {order.status === "pending" && <Button variant="destructive">Cancel Order</Button>}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
