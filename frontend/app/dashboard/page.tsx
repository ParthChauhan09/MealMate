"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, Heart, Clock, MapPin, Calendar, TrendingUp, Package, CheckCircle } from "lucide-react"

interface Order {
  _id: string
  meal: {
    _id: string
    name: string
    price: number
    description: string
  }
  provider: {
    _id: string
    name: string
  }
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  quantity: number
  deliveryAddress: string
  deliveryDate: string
  specialInstructions?: string
  createdAt: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: TrendingUp,
  delivered: CheckCircle,
  cancelled: Clock,
}

export default function CustomerDashboard() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    favoriteChefs: 0,
    totalSpent: 0,
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  // Remove auto-refresh - not needed

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.data)

        // Calculate stats
        const totalOrders = data.data.length
        const activeOrders = data.data.filter((order: Order) =>
          ["pending", "confirmed", "preparing", "ready"].includes(order.status),
        ).length
        const totalSpent = data.data
          .filter((order: Order) => order.status === "delivered")
          .reduce((sum: number, order: Order) => sum + order.meal.price * order.quantity, 0)

        setStats({
          totalOrders,
          activeOrders,
          favoriteChefs: 5, // This would come from a separate API
          totalSpent,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorite Chefs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.favoriteChefs}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track your recent meal orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring delicious homemade meals!</p>
                    <Button>Browse Meals</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order, index) => {
                      const StatusIcon = statusIcons[order.status]
                      return (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <StatusIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{order.meal.name}</h4>
                              <p className="text-sm text-gray-600">by {order.provider.name}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Qty: {order.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[order.status]}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              ₹{order.meal.price * order.quantity}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
