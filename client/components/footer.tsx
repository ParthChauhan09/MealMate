import Link from "next/link"
import { ShoppingBag, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <ShoppingBag className="h-6 w-6 text-amber-500" />
              <span>MealMate</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Connecting you with homemade meals and tiffin services in your area.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-amber-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-amber-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-amber-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-amber-500 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/meals" className="text-gray-500 hover:text-amber-500 text-sm">
                  Browse Meals
                </Link>
              </li>
              <li>
                <Link href="/providers" className="text-gray-500 hover:text-amber-500 text-sm">
                  Our Providers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-amber-500 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-amber-500 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-amber-500 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-amber-500 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-500 hover:text-amber-500 text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail className="h-4 w-4 text-amber-500" />
                <span>support@mealmate.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Phone className="h-4 w-4 text-amber-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4 text-amber-500 mt-1" />
                <span>123 Food Street, Kitchen City, Meal State, 12345</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} MealMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
