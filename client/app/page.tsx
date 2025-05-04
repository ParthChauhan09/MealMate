"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, UtensilsCrossed, Clock, Star, ShoppingBag } from "lucide-react"
import { useInView } from "framer-motion"
import { useRef } from "react"
import FeaturedMeals from "@/components/featured-meals"

export default function Home() {
  const featuredRef = useRef(null)
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.3 })

  const howItWorksRef = useRef(null)
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.3 })

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-amber-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Homemade Meals, <span className="text-amber-500">Delivered</span> to Your Door
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Connect with local chefs and enjoy authentic homemade meals and tiffin services. Fresh, delicious, and
                  convenient.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
                  <Link href="/meals">
                    Browse Meals <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/register">Become a Provider</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto lg:mx-0 relative"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  alt="Homemade meal"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  src="/placeholder.svg?height=550&width=800"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <UtensilsCrossed className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">100+ Providers</p>
                  <p className="text-sm text-gray-500">Ready to serve you</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <motion.section
        ref={howItWorksRef}
        initial={{ opacity: 0 }}
        animate={howItWorksInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-12 md:py-24 bg-white"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How MealMate Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Connecting you with homemade goodness in just a few simple steps
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-12 pt-12">
            {[
              {
                icon: <UtensilsCrossed className="h-10 w-10 text-amber-500" />,
                title: "Browse Meals",
                description: "Explore a variety of homemade meals from local providers in your area.",
              },
              {
                icon: <ShoppingBag className="h-10 w-10 text-amber-500" />,
                title: "Place an Order",
                description: "Select your favorite meals and place an order with just a few clicks.",
              },
              {
                icon: <Clock className="h-10 w-10 text-amber-500" />,
                title: "Enjoy Your Meal",
                description: "Receive your freshly prepared meal at your doorstep and enjoy!",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center space-y-4 text-center"
              >
                <div className="bg-amber-50 p-4 rounded-full">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Meals */}
      <motion.section
        ref={featuredRef}
        initial={{ opacity: 0 }}
        animate={featuredInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-12 md:py-24 bg-amber-50"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Meals</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover our most popular homemade meals from top-rated providers
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl pt-12">
            <FeaturedMeals />
          </div>
          <div className="flex justify-center mt-12">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
              <Link href="/meals">
                View All Meals <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Customers Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 pt-12">
            {[
              {
                name: "Sarah Johnson",
                text: "MealMate has been a lifesaver for my busy schedule. The homemade meals are delicious and remind me of my mom's cooking!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                text: "As someone who can't cook, MealMate has transformed my eating habits. Now I enjoy healthy, homemade food every day.",
                rating: 5,
              },
              {
                name: "Priya Sharma",
                text: "The variety of cuisines available is amazing. I've discovered so many new flavors through MealMate's providers.",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                    ))}
                </div>
                <p className="text-gray-500 italic">"{testimonial.text}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-amber-500">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Enjoy Homemade Meals?
              </h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join MealMate today and discover the joy of homemade food delivered to your doorstep
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-white text-amber-500 hover:bg-gray-100">
                <Link href="/auth/register">
                  Sign Up Now <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-amber-600">
                <Link href="/meals">Browse Meals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
