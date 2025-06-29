"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface CartItem {
  _id: string
  name: string
  price: number
  category: string
  photo?: string
  provider: {
    _id: string
    name: string
  }
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (meal: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (mealId: string) => void
  updateQuantity: (mealId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (mealId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: React.ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mealmate-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('mealmate-cart')
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mealmate-cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  const addToCart = (meal: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === meal._id)
      
      if (existingItem) {
        // If item already exists, increase quantity
        toast({
          title: "Quantity updated",
          description: `${meal.name} quantity increased in cart.`,
        })
        return prevItems.map(item =>
          item._id === meal._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Add new item to cart
        toast({
          title: "Added to cart",
          description: `${meal.name} has been added to your cart.`,
        })
        return [...prevItems, { ...meal, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (mealId: string) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item._id === mealId)
      if (item) {
        toast({
          title: "Removed from cart",
          description: `${item.name} has been removed from your cart.`,
        })
      }
      return prevItems.filter(item => item._id !== mealId)
    })
  }

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === mealId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (mealId: string) => {
    return cartItems.some(item => item._id === mealId)
  }

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
