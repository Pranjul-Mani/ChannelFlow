"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeInOut" },
}

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@channelflow.com",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 98765 XXXXX",
      description: "Mon-Fri from 9am to 6pm",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Mumbai, Maharashtra, India",
      description: "Come say hello at our office",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: "Mon-Fri: 9AM-6PM IST",
      description: "Weekend support available",
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#edf2f4" }}>
      <Navbar />
      <main className="pt-10 pb-16">
        {/* Header Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeIn} initial="initial" animate="animate">
              <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm text-cyan-600 mb-4">
                Get In Touch
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">Contact Our Team</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
                Have questions about ChannelFlow? We're here to help you transform your hotel management experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.title}
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-all duration-300 shadow-lg"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{info.title}</h3>
                  <p className="text-slate-800 font-medium mb-1">{info.details}</p>
                  <p className="text-slate-600 text-sm">{info.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        placeholder="Tony"
                        className="bg-white border-slate-300 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        placeholder="Stark"
                        className="bg-white border-slate-300 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="stark@example.com"
                      className="bg-white border-slate-300 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 XXXXX"
                      className="bg-white border-slate-300 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      className="bg-white border-slate-300 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us more about your requirements..."
                      className="bg-white border-slate-300 focus:border-cyan-500"
                    />
                  </div>

                  <Button type="submit"  disabled className="cursor-pointer w-full bg-cyan-500 hover:bg-cyan-600 text-white ">
                    Send Message
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Why Choose ChannelFlow?</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>24/7 customer support with dedicated account managers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Free onboarding and training for your entire team</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>99.9% uptime guarantee with enterprise-grade security</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Custom integrations and white-label solutions available</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Need Immediate Help?</h3>
                  <p className="text-slate-600 mb-4">
                    For urgent technical issues or billing questions, our support team is available 24/7.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50 bg-transparent"
                  >
                    <Link href="tel:+9198765XXXXX">
                      Call Support Now
                      <Phone className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      
    </div>
  )
}
