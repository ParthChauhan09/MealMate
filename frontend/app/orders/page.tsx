"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  RefreshCw
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

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
        toast({
          title: "Order updated",
          description: `Order status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.text || newStatus}.`,
        })
        // Refresh orders to get updated data
        fetchOrders()
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

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Order cancelled",
          description: "Your order has been cancelled successfully.",
        })
        // Refresh orders to show updated status
        fetchOrders()
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.role === "provider" ? "Order Management" : "My Orders"}
                </h1>
                <p className="text-gray-600">
                  {user?.role === "provider"
                    ? "Manage orders for your meals"
                    : "Track your meal orders"
                  }
                </p>
              </div>

              {/* Manual refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "All Orders" : statusConfig[status as keyof typeof statusConfig]?.text || status}
                {status !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {orders.filter(order => order.status === status).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">
                    {filter === "all" 
                      ? "You don't have any orders yet." 
                      : `No orders with status "${filter}".`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order, index) => {
                const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
                const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
                
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: updatingOrders.has(order._id) ? 0.98 : 1
                    }}
                    transition={{
                      delay: index * 0.1,
                      scale: { duration: 0.2 }
                    }}
                    className={updatingOrders.has(order._id) ? "ring-2 ring-orange-300 ring-opacity-50" : ""}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${statusInfo?.color || "bg-gray-500"}`}>
                              <StatusIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                              <p className="text-sm text-gray-600">
                                Order #{order._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={`${statusInfo?.color || "bg-gray-500"} text-white`}
                          >
                            {statusInfo?.text || order.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-semibold">₹{order.meal.price * order.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Quantity</p>
                              <p className="font-semibold">{order.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Delivery Date</p>
                              <p className="font-semibold">
                                {new Date(order.deliveryDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Address</p>
                              <p className="font-semibold text-sm">{order.deliveryAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Provider/Customer Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              {user?.role === "provider" ? "Customer" : "Chef"}
                            </p>
                            <p className="font-medium">
                              {user?.role === "provider" ? order.user.name : order.provider.name}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Special Instructions:</p>
                            <p className="text-sm">{order.specialInstructions}</p>
                          </div>
                        )}

                        {/* Status Progress */}
                        <div className="mb-4">
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

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {getStatusActions(order)}
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
              })
            )}
          </div>
        </motion.div>
      </div>

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
                    <label className="text-sm font-medium text-gray-600">Customer</label>
                    <p className="text-sm">{selectedOrder.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
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
    </div>
  )
}
