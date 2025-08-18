"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart, Zap, Globe, Shield, Calendar, BarChart3, Star, Quote } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeInOut" },
}

export default function LandingPage() {
  const partners = ["Booking.com", "Agoda", "Expedia", "MakeMyTrip", "Goibibo", "Cleartrip", "Airbnb"]

  const testimonials = [
    {
      name: "Wanda Johnson",
      role: "Hotel Manager",
      company: "Grand Plaza Hotel",
      content:
        "ChannelFlow transformed our operations completely. We've seen a 40% increase in bookings and our staff efficiency has improved dramatically.",
      rating: 5,
      image: "/Wanda.jpg",
    },
    {
      name: "Stark",
      role: "Operations Director",
      company: "Luxury Suites Chain",
      content:
        "The real-time synchronization is a game-changer. No more double bookings, no more manual updates. It just works seamlessly.",
      rating: 5,
      image: "/Stark.jpg",
    },
    {
      name: "Emma Rodriguez",
      role: "Revenue Manager",
      company: "Boutique Hotels Group",
      content:
        "Our revenue has increased by 35% since implementing ChannelFlow. The analytics and insights are incredibly valuable.",
      rating: 5,
      image: "/Gemin.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br  from-slate-950 via-slate-900 to-teal-900">
      {/* Header */}
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Video Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover ">
              <source src="/landing3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Hero Content Over Video */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Synchronize Your{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                  Success
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
                The future of hotel management is here. Instantly connect to all your channels with a single,
                intelligent platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-lg px-8 py-4 shadow-lg"
                  >
                    <Link href="/dashboard">
                      View Dashboard Demo
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block rounded-lg bg-slate-900/70 px-3 py-1 text-sm text-cyan-400 mb-4">
                Core Features
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Manage Your Hotel</h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                Streamline operations, maximize revenue, and provide exceptional guest experiences
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Sync Engine",
                  description: "Real-time, two-way synchronization with all major OTAs. Never miss a booking.",
                  iconBg: "bg-green-400/20",
                  iconColor: "text-green-400",
                },
                {
                  icon: BarChart,
                  title: "Unified Dashboard",
                  description: "All your bookings, revenue data, and analytics in one futuristic interface.",
                  iconBg: "bg-cyan-400/20",
                  iconColor: "text-cyan-400",
                },
                {
                  icon: Shield,
                  title: "Secure & Reliable",
                  description: "Enterprise-grade security with 99.9% uptime guarantee.",
                  iconBg: "bg-purple-400/20",
                  iconColor: "text-purple-400",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-200">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Infinite Scrolling Partner Logos Section */}
        <section className="relative z-10 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Travel Partners</h2>
          </div>
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll">
              {partners.map((name) => (
                <li key={name} className="text-xl font-semibold text-slate-300 whitespace-nowrap">
                  {name}
                </li>
              ))}
            </ul>
            <ul
              className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll"
              aria-hidden="true"
            >
              {partners.map((name) => (
                <li key={name} className="text-xl font-semibold text-slate-300 whitespace-nowrap">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="dashboard" className="relative z-10 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Your Command Center</h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                Get a complete overview of your hotel's performance at a glance
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl"
            >
              <div className="block hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Channel Manager Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600">Live</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Todays Arrivals</p>
                          <p className="text-3xl font-bold text-slate-800">11</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Todays Departure</p>
                          <p className="text-3xl font-bold text-slate-800">5</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Active Channels</p>
                          <p className="text-3xl font-bold text-slate-800">7</p>
                          <p className="text-xs text-slate-500">of 7 total</p>
                        </div>
                        <Globe className="w-8 h-8 text-orange-400" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative z-10 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block rounded-lg bg-slate-900/70 px-3 py-1 text-sm text-cyan-400 mb-4">
                Client Success Stories
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                Discover how hoteliers worldwide are transforming their operations with ChannelFlow
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  variants={fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-cyan-400 mb-2" />
                  </div>

                  <p className="text-slate-200 mb-6 leading-relaxed">"{testimonial.content}"</p>

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, index) => (
                      <Star key={index} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                      <p className="text-cyan-400 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative z-10 py-20 px-4">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white mb-4">
                Ready to Unlock Your Hotel's Full Potential?
              </h2>
              <p className="mx-auto max-w-[600px] text-slate-200 md:text-xl/relaxed mb-8">
                Join the next generation of hoteliers. Start your free trial today and experience the future of
                management.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mx-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  <Link href="/">
                    Claim Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <p className="text-white text-sm">© 2025 All rights reserved.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                <Link href="/" className="text-white hover:text-cyan-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/" className="text-white hover:text-cyan-400 transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/" className="text-white hover:text-cyan-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-white text-sm">Made with ❤️ for hoteliers worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
