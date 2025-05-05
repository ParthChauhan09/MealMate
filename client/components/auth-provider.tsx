"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  _id: string
  name: string
  email: string
  role: "customer" | "provider" | "admin"
  profilePhoto?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
}

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer" as const,
    profilePhoto: "/placeholder.svg?height=100&width=100",
  },
  {
    _id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "provider" as const,
    profilePhoto: "/placeholder.svg?height=100&width=100",
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("mealmate_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== "undefined") {
      checkAuthStatus()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user in mock data
      const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)

      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser

      // Store user in localStorage
      localStorage.setItem("mealmate_user", JSON.stringify(userWithoutPassword))

      setUser(userWithoutPassword)
      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: any) => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email already exists
      if (MOCK_USERS.some((u) => u.email === userData.email)) {
        throw new Error("Email already in use")
      }

      // Create new user
      const newUser = {
        _id: `user${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profilePhoto: "/placeholder.svg?height=100&width=100",
      }

      // Store user in localStorage
      localStorage.setItem("mealmate_user", JSON.stringify(newUser))

      setUser(newUser)
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove user from localStorage
      localStorage.removeItem("mealmate_user")

      setUser(null)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
