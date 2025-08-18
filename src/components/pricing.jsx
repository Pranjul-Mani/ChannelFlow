"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeInOut" },
}

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "₹2,999",
      period: "/month",
      description: "Perfect for small hotels and B&Bs",
      features: [
        "Up to 20 rooms",
        "3 channel connections",
        "Basic analytics",
        "Email support",
        "Mobile app access",
        "Standard sync speed",
      ],
      popular: false,
      cta: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "₹7,999",
      period: "/month",
      description: "Ideal for growing hotel businesses",
      features: [
        "Up to 100 rooms",
        "10 channel connections",
        "Advanced analytics & reports",
        "Priority support",
        "Mobile app access",
        "Real-time sync",
        "Revenue management tools",
        "Custom integrations",
      ],
      popular: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large hotel chains and groups",
      features: [
        "Unlimited rooms",
        "Unlimited channels",
        "White-label solution",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom development",
        "Advanced security",
        "Multi-property management",
      ],
      popular: false,
      cta: "Contact Sales",
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
                Pricing Plans
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">Choose Your Perfect Plan</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                Start with a 14-day free trial. No credit card required. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.2 }}
                  className={`relative bg-white/80 backdrop-blur-sm border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular
                      ? "border-cyan-500 ring-2 ring-cyan-500/20 scale-105"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                    <p className="text-slate-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                      <span className="text-slate-600 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    <Link href="/contact">
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-slate-600">Everything you need to know about our pricing</p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "Can I change my plan anytime?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  question: "Is there a setup fee?",
                  answer: "No setup fees. We'll help you get started with a dedicated onboarding specialist.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, bank transfers, and digital wallets.",
                },
                {
                  question: "Do you offer discounts for annual billing?",
                  answer: "Yes, save 20% when you pay annually. Contact our sales team for custom pricing.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      {/* <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <p className="text-slate-500 text-sm">© 2025 All rights reserved.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                <Link href="/" className="text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/" className="text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-slate-500 text-sm">Made with ❤️ for hoteliers worldwide</span>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
