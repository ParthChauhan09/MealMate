"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              {/* 404 Animation */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <div className="text-8xl mb-4">🍽️</div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! This page could not be found
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  The page you're looking for doesn't exist or has been moved. 
                  Don't worry, let's get you back to discovering delicious meals!
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                
                <Link href="/meals">
                  <Button variant="outline" className="px-6 py-3">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Meals
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  onClick={() => window.history.back()}
                  className="px-6 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </motion.div>

              {/* Helpful Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-8 border-t border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-4">
                  Need help? Try these popular pages:
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <Link href="/orders" className="text-orange-600 hover:text-orange-700">
                    My Orders
                  </Link>
                  <Link href="/dashboard" className="text-orange-600 hover:text-orange-700">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="text-orange-600 hover:text-orange-700">
                    Profile
                  </Link>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
