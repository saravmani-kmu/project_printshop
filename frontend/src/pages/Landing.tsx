import { Link } from "react-router-dom";
import {
  CreditCard, BookOpen, Gift, FileText, Tag, Calendar,
  Star, Shield, Truck, Clock, ArrowRight, CheckCircle, Phone
} from "lucide-react";

const PRODUCTS = [
  { icon: CreditCard, name: "Visiting Cards", desc: "Professional cards that make lasting impressions", from: 299, color: "bg-violet-100 text-violet-600" },
  { icon: BookOpen, name: "Bill Books", desc: "Custom GST bill books with your branding", from: 399, color: "bg-blue-100 text-blue-600" },
  { icon: Gift, name: "Greeting Cards", desc: "Personalised cards for every occasion", from: 499, color: "bg-pink-100 text-pink-600" },
  { icon: FileText, name: "Pamphlets & Flyers", desc: "Eye-catching promotions for your business", from: 599, color: "bg-orange-100 text-orange-600" },
  { icon: Tag, name: "Stickers & Labels", desc: "Custom stickers for products and branding", from: 249, color: "bg-green-100 text-green-600" },
  { icon: Calendar, name: "Calendars", desc: "Branded calendars for corporate gifting", from: 1499, color: "bg-red-100 text-red-600" },
];

const FEATURES = [
  { icon: Star, title: "Premium Quality", desc: "Sharp prints on high-grade paper and materials" },
  { icon: Shield, title: "Secure Ordering", desc: "Google login, safe payments, data protected" },
  { icon: Truck, title: "Fast Delivery", desc: "Quick turnaround across Tamil Nadu and India" },
  { icon: Clock, title: "Easy Reorder", desc: "Your designs saved for quick future orders" },
];

const TESTIMONIALS = [
  { name: "Ramesh Kumar", role: "Small Business Owner", text: "Excellent quality visiting cards! Got 500 cards delivered in 3 days. Highly recommend PrintShop.", stars: 5 },
  { name: "Priya Shankar", role: "Event Organizer", text: "Ordered greeting cards for Diwali. Beautiful prints, great discounts for bulk orders.", stars: 5 },
  { name: "Vijay Enterprises", role: "B2B Customer", text: "We order bill books every month. Consistent quality and the B2B pricing is very competitive.", stars: 5 },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Best Prices in Tamil Nadu — Guaranteed
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Design & Print.<br />
              <span className="text-yellow-300">Fast. Affordable.</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-xl">
              Custom visiting cards, bill books, greeting cards and more — delivered to your door.
              Choose from premium templates or upload your own design.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 text-lg shadow-lg">
                Browse Products <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-3 rounded-xl border-2 border-white/30 transition-colors text-lg">
                Get Started Free
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary-200">
              {["No minimum order", "Free design support", "GST invoice provided", "Pan India delivery"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Products</h2>
            <p className="text-gray-500 mt-2 text-lg">Premium printing for every business need</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p) => (
              <Link key={p.name} to="/products" className="card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${p.color}`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{p.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{p.desc}</p>
                  <p className="text-primary-600 font-semibold mt-2 text-sm">Starting ₹{p.from}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/products" className="btn-primary">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose PrintShop?</h2>
            <p className="text-gray-500 mt-2 text-lg">We make printing simple, fast and reliable</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900">{f.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-extrabold mb-3">Special B2B Pricing</h2>
              <p className="text-primary-100 text-lg max-w-md">
                Running a business? Get up to 30% off on bulk orders with our B2B membership.
                Exclusive pricing, priority support, and monthly invoicing.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Link to="/login" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-3 rounded-xl transition-colors text-lg whitespace-nowrap">
                Join as B2B Customer
              </Link>
              <span className="text-primary-200 text-sm">Free registration · No commitment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">Ready to print?</h2>
          <p className="text-primary-200 text-lg mb-8">Sign in with Google and place your first order in minutes.</p>
          <Link to="/login" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-10 py-4 rounded-xl transition-colors text-lg inline-flex items-center gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">PrintShop India</p>
            <p className="text-sm mt-1">Premium printing for every occasion</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4" />
            <span>Contact us for bulk enquiries</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} PrintShop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
