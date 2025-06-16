"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  Clock,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  Star,
  AlertCircle,
  TrendingUp,
  Filter,
} from "lucide-react"

interface Order {
  _id: string
  meal: {
    _id: string
    name: string
    price: number
    category: string
  }
  user: {
    _id: string
    name: string
  }
  provider: {
    _id: string
    name: string
  }
  status: string
  quantity: number
  deliveryAddress: string
  deliveryDate: string
  specialInstructions?: string
  createdAt: string
}

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: "bg-yellow-500", 
    text: "Pending",
    description: "Waiting for confirmation"
  },
  confirmed: { 
    icon: CheckCircle, 
    color: "bg-blue-500", 
    text: "Confirmed",
    description: "Order confirmed by chef"
  },
  preparing: { 
    icon: ChefHat, 
    color: "bg-purple-500", 
    text: "Preparing",
    description: "Your meal is being prepared"
  },
  ready: { 
    icon: Package, 
    color: "bg-orange-500", 
    text: "Ready",
    description: "Ready for pickup/delivery"
  },
  delivered: { 
    icon: Truck, 
    color: "bg-green-500", 
    text: "Delivered",
    description: "Order completed"
  },
  cancelled: { 
    icon: XCircle, 
    color: "bg-red-500", 
    text: "Cancelled",
    description: "Order cancelled"
  }
}

export default function OrdersPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("pending") // Will be set properly in useEffect

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  // Set initial tab based on user role
  useEffect(() => {
    if (user?.role === "provider") {
      setActiveTab("pending")
    } else {
      setActiveTab("active")
    }
  }, [user?.role])

  // Remove auto-refresh - not needed for this implementation

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
      } else {
        throw new Error("Failed to fetch orders")
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId))

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the order in local state immediately
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        )

        toast({
          title: "Order updated",
          description: `Order status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.text || newStatus}.`,
        })

        // Auto-switch tabs for better UX
        if (user?.role === "provider") {
          if (newStatus === "confirmed" || newStatus === "preparing" || newStatus === "ready") {
            setActiveTab("active")
          } else if (newStatus === "delivered" || newStatus === "cancelled") {
            setActiveTab("completed")
          }
        }

        // Don't call fetchOrders() to avoid page refresh and tab reset
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update order")
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update order status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return
    }

    setUpdatingOrders(prev => new Set(prev).add(orderId))

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Update the order status in local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        )

        toast({
          title: "Order cancelled",
          description: "Your order has been cancelled successfully.",
        })

        // Auto-switch to history tab for customers
        if (user?.role === "customer") {
          setActiveTab("history")
        }

        // Don't call fetchOrders() to avoid page refresh
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel order")
      }
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Failed to cancel order.",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true
    return order.status === filter
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const getStatusActions = (order: Order) => {
    const actions = []
    const isUpdating = updatingOrders.has(order._id)

    if (user?.role === "provider" && order.provider._id === user._id) {
      // Provider actions
      if (order.status === "pending") {
        actions.push(
          <Button
            key="confirm"
            size="sm"
            onClick={() => updateOrderStatus(order._id, "confirmed")}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </Button>
        )
      }
      if (order.status === "confirmed") {
        actions.push(
          <Button
            key="preparing"
            size="sm"
            onClick={() => updateOrderStatus(order._id, "preparing")}
            className="bg-purple-500 hover:bg-purple-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Start Preparing"}
          </Button>
        )
      }
      if (order.status === "preparing") {
        actions.push(
          <Button
            key="ready"
            size="sm"
            onClick={() => updateOrderStatus(order._id, "ready")}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Mark Ready"}
          </Button>
        )
      }
      if (order.status === "ready") {
        actions.push(
          <Button
            key="delivered"
            size="sm"
            onClick={() => updateOrderStatus(order._id, "delivered")}
            className="bg-green-500 hover:bg-green-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Mark Delivered"}
          </Button>
        )
      }
    }

    // Customer actions
    if (user?.role === "customer" && order.user._id === user._id) {
      if (["pending", "confirmed"].includes(order.status)) {
        actions.push(
          <Button
            key="cancel"
            size="sm"
            variant="destructive"
            onClick={() => cancelOrder(order._id)}
            disabled={isUpdating}
          >
            {isUpdating ? "Cancelling..." : "Cancel Order"}
          </Button>
        )
      }
    }

    return actions
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Render different interfaces based on user role
  if (user?.role === "provider") {
    return <ChefOrdersInterface />
  } else {
    return <CustomerOrdersInterface />
  }

  // Chef Orders Interface
  function ChefOrdersInterface() {
    const pendingOrders = orders.filter(order => order.status === "pending")
    const activeOrders = orders.filter(order => ["confirmed", "preparing", "ready"].includes(order.status))
    const completedOrders = orders.filter(order => ["delivered", "cancelled"].includes(order.status))

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Chef Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <ChefHat className="w-8 h-8 text-orange-500" />
                    Order Management
                  </h1>
                  <p className="text-gray-600">Manage incoming orders and track your business</p>
                </div>

                <Button
                  variant="outline"
                  onClick={fetchOrders}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Chef Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Today</p>
                      <p className="text-2xl font-bold text-green-600">
                        {completedOrders.filter(order =>
                          new Date(order.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{completedOrders
                          .filter(order =>
                            new Date(order.createdAt).toDateString() === new Date().toDateString() &&
                            order.status === "delivered"
                          )
                          .reduce((sum, order) => sum + (order.meal.price * order.quantity), 0)
                        }
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chef Order Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Pending ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Active ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Completed ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <ChefPendingOrders orders={pendingOrders} />
              </TabsContent>

              <TabsContent value="active">
                <ChefActiveOrders orders={activeOrders} />
              </TabsContent>

              <TabsContent value="completed">
                <ChefCompletedOrders orders={completedOrders} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    )
  }

  // Customer Orders Interface
  function CustomerOrdersInterface() {
    const activeOrders = orders.filter(order => !["delivered", "cancelled"].includes(order.status))
    const pastOrders = orders.filter(order => ["delivered", "cancelled"].includes(order.status))

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Customer Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-500" />
                    My Orders
                  </h1>
                  <p className="text-gray-600">Track your meal orders and order history</p>
                </div>

                <Button
                  variant="outline"
                  onClick={fetchOrders}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-green-600">{orders.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{orders
                          .filter(order => order.status === "delivered")
                          .reduce((sum, order) => sum + (order.meal.price * order.quantity), 0)
                        }
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Order Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Active Orders ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Order History ({pastOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <CustomerActiveOrders orders={activeOrders} />
              </TabsContent>

              <TabsContent value="history">
                <CustomerOrderHistory orders={pastOrders} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    )
  }

  // Chef Pending Orders Component
  function ChefPendingOrders({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
            <p className="text-gray-600">New orders will appear here for your approval</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                    <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">
                    New Order
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{order.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">₹{order.meal.price * order.quantity}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">Delivery Address</p>
                  </div>
                  <p className="text-sm bg-gray-50 p-2 rounded">{order.deliveryAddress}</p>
                </div>

                {order.specialInstructions && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Special Instructions:</p>
                    <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">{order.specialInstructions}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateOrderStatus(order._id, "confirmed")}
                    disabled={updatingOrders.has(order._id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updatingOrders.has(order._id) ? "Accepting..." : "Accept Order"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateOrderStatus(order._id, "cancelled")}
                    disabled={updatingOrders.has(order._id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {updatingOrders.has(order._id) ? "Declining..." : "Decline"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // Chef Active Orders Component
  function ChefActiveOrders({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
            <p className="text-gray-600">Accepted orders will appear here</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order, index) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo?.icon || Package

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                order.status === "confirmed" ? "border-l-blue-500" :
                order.status === "preparing" ? "border-l-purple-500" :
                "border-l-orange-500"
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusInfo?.color}`}>
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                        <p className="text-sm text-gray-600">Order #{order._id.slice(-8)} • {order.user.name}</p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo?.color} text-white`}>
                      {statusInfo?.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">₹{order.meal.price * order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Date</p>
                        <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Order Time</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "confirmed" && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, "preparing")}
                        disabled={updatingOrders.has(order._id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {updatingOrders.has(order._id) ? "Starting..." : "Start Preparing"}
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, "ready")}
                        disabled={updatingOrders.has(order._id)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {updatingOrders.has(order._id) ? "Marking..." : "Mark Ready"}
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, "delivered")}
                        disabled={updatingOrders.has(order._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingOrders.has(order._id) ? "Delivering..." : "Mark Delivered"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Chef Completed Orders Component
  function ChefCompletedOrders({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed orders</h3>
            <p className="text-gray-600">Completed orders will appear here</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order, index) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo?.icon || CheckCircle

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                order.status === "delivered" ? "border-l-green-500" : "border-l-red-500"
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusInfo?.color}`}>
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                        <p className="text-sm text-gray-600">Order #{order._id.slice(-8)} • {order.user.name}</p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo?.color} text-white`}>
                      {statusInfo?.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Earnings</p>
                        <p className="font-medium text-green-600">
                          {order.status === "delivered" ? `₹${order.meal.price * order.quantity}` : "₹0"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Completed Date</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="font-medium">Not rated yet</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Customer Active Orders Component
  function CustomerActiveOrders({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
            <p className="text-gray-600">Your active orders will appear here</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {orders.map((order, index) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo?.icon || Clock

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusInfo?.color}`}>
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                        <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo?.color} text-white`}>
                      {statusInfo?.text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Chef</p>
                        <p className="font-medium">{order.provider.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium">₹{order.meal.price * order.quantity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Order Progress</span>
                      <span className="text-sm text-gray-500">{statusInfo?.description}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {["pending", "confirmed", "preparing", "ready", "delivered"].map((status, idx) => {
                        const isActive = ["pending", "confirmed", "preparing", "ready", "delivered"].indexOf(order.status) >= idx
                        const isCurrent = order.status === status
                        const isCompleted = ["pending", "confirmed", "preparing", "ready", "delivered"].indexOf(order.status) > idx

                        return (
                          <div key={status} className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                                isCompleted
                                  ? "bg-green-500 border-green-500"
                                  : isCurrent
                                    ? "bg-orange-500 border-orange-500 animate-pulse"
                                    : isActive
                                      ? "bg-blue-500 border-blue-500"
                                      : "bg-gray-200 border-gray-300"
                              }`}
                            />
                            {idx < 4 && (
                              <div
                                className={`w-8 h-0.5 transition-all duration-300 ${
                                  isCompleted || (isActive && idx < ["pending", "confirmed", "preparing", "ready", "delivered"].indexOf(order.status))
                                    ? "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between mt-1">
                      {["Pending", "Confirmed", "Preparing", "Ready", "Delivered"].map((label, idx) => (
                        <span
                          key={label}
                          className={`text-xs transition-all duration-300 ${
                            ["pending", "confirmed", "preparing", "ready", "delivered"].indexOf(order.status) >= idx
                              ? "text-gray-700 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {["pending", "confirmed"].includes(order.status) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelOrder(order._id)}
                        disabled={updatingOrders.has(order._id)}
                      >
                        {updatingOrders.has(order._id) ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Customer Order History Component
  function CustomerOrderHistory({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No order history</h3>
            <p className="text-gray-600">Your completed orders will appear here</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order, index) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo?.icon || Clock

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="opacity-90 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusInfo?.color}`}>
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Order #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo?.color} text-white`}>
                      {statusInfo?.text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Chef</p>
                        <p className="font-medium">{order.provider.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="font-medium">₹{order.meal.price * order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Date</p>
                        <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate Order
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Main render - choose interface based on user role
  return (
    <>
      {user?.role === "provider" ? <ChefOrdersInterface /> : <CustomerOrdersInterface />}

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">{selectedOrder.meal.name}</h3>
                  <p className="text-sm text-gray-600">Order #{selectedOrder._id.slice(-8)}</p>
                </div>
                <Badge className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color || "bg-gray-500"} text-white`}>
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.text || selectedOrder.status}
                </Badge>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {user?.role === "provider" ? "Customer" : "Chef"}
                    </label>
                    <p className="text-sm">
                      {user?.role === "provider" ? selectedOrder.user.name : selectedOrder.provider.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Quantity</label>
                    <p className="text-sm">{selectedOrder.quantity}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-sm font-semibold">₹{selectedOrder.meal.price * selectedOrder.quantity}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Date</label>
                    <p className="text-sm">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Order Date</label>
                    <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">{statusConfig[selectedOrder.status as keyof typeof statusConfig]?.description}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedOrder.deliveryAddress}</p>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Special Instructions</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedOrder.specialInstructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {getStatusActions(selectedOrder)}
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetails(false)}
                  className="ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
