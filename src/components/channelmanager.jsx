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

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "inventory", label: "Inventory", icon: Calendar },
    { id: "reservation", label: "Reservation", icon: BedDouble },
  ]

  // Handle navigation clicks
  const handleNavClick = (item) => {
    setActiveTab(item.id)
  }

  // Get the index of the active tab for glider positioning
  const getActiveTabIndex = () => {
    return navItems.findIndex((item) => item.id === activeTab)
  }

  // Check authentication status on component mount
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Render different components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard channels={channels} />
      case "calendar":
        return <CalendarView />
      case "reservation":
        return <Reservation channels={channels} />
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
    <div className="min-h-screen bg-gray-50">
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

            {/* Glass Navigation - Desktop */}
            <nav className="hidden md:block mr-16">
              <div className="relative flex bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.2),inset_-1px_-1px_6px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Glider */}
                <div
                  className="absolute top-0 bottom-0 rounded-2xl z-10 transition-all duration-500 ease-[cubic-bezier(0.37,1.95,0.66,0.56)] bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_0_18px_rgba(59,130,246,0.5),0_0_10px_rgba(147,197,253,0.4)_inset]"
                  style={{
                    width: `${100 / navItems.length}%`,
                    transform: `translateX(${getActiveTabIndex() * 100}%)`,
                  }}
                />

                {/* Navigation Items */}
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`relative z-20 flex items-center space-x-2 px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 cursor-pointer min-w-[120px] justify-center ${activeTab === item.id ? "text-white" : "text-gray-600 hover:text-black"
                        }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation - Glass Style */}
        <div className="md:hidden px-6 py-3 border-t border-gray-200">
          <div className="relative flex bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.2),inset_-1px_-1px_6px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden overflow-x-auto">
            {/* Mobile Glider */}
            <div
              className="absolute top-0 bottom-0 rounded-2xl z-10 transition-all duration-500 ease-[cubic-bezier(0.37,1.95,0.66,0.56)] bg-gradient-to-br from-blue-400/30 to-blue-600/40 shadow-[0_0_18px_rgba(59,130,246,0.5),0_0_10px_rgba(147,197,253,0.4)_inset]"
              style={{
                width: `${100 / navItems.length}%`,
                transform: `translateX(${getActiveTabIndex() * 100}%)`,
              }}
            />

            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative z-20 flex items-center space-x-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-300 min-w-[100px] justify-center ${activeTab === item.id ? "text-white" : "text-gray-600 hover:text-white"
                    }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main >{renderContent()}</main>
    </div>
  )
}

export default HotelChannelManager
