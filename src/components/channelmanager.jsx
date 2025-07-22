"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, BedDouble, Users, TrendingUp } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import Dashboard from "./dashboard"
import Inventory from "../app/room/page"
import CalendarView from "./calendar-view"
import Bookings from "./bookings"
import Reservation from "./reservaton"
import Link from "next/link"

const HotelChannelManager = () => {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  // Mock data for channels
  const [channels] = useState([])

  // Navigation items (for internal navigation only)
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "reservation", label: "Reservation", icon: BedDouble },
    { id: "inventory", label: "Inventory & Rates", icon: Calendar },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: Users },
  ]

  // Handle main navigation clicks
  const handleNavClick = (item) => {
    if (item.external) {
      window.open(item.route, '_blank')
    } else {
      setActiveTab(item.id)
    }
  }

  // Check authentication status on component mount
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Render different components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard channels={channels} />
      case "reservation":
        return <Reservation channels={channels} />
      case "calendar":
        return <CalendarView />
      case "inventory":
        return <Inventory />
      case "bookings":
        return <Bookings />
      default:
        return <Dashboard channels={channels} />
    }
  }

  // Show loading or redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50"> {/* Added pt-16 for navbar space */}
      {/* Internal Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <Link href="/">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 ml-10">ChannelFlow</h1>
              
            </div>
            </Link>

            {/* Internal Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden px-6 py-3 border-t border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default HotelChannelManager
