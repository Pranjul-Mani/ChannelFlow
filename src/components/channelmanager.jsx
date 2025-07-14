"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, BedDouble ,Users, Utensils, TrendingUp, ChevronDown, User, LogOut } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import Dashboard from "./dashboard"
import Inventory from "../app/room/page"
import CalendarView from "./calendar-view"
import Bookings from "./bookings"
import Reservation from "./reservaton"


const HotelChannelManager = () => {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false)

  // Mock data for channels
  const [channels] = useState([])


  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "reservation", label: "Reservation", icon: BedDouble },
    { id: "inventory", label: "Inventory & Rates", icon: Calendar },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: Users },
  ]

  const adminMenuItems = [
    { id: "profile", label: "Profile", icon: User, route: "/admin/profile" },
    { id: "staff", label: "Staff Management", icon: Users, route: "/admin/staff" },
    { id: "logout", label: "Logout", icon: LogOut, action: "logout" },
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

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Handle admin menu clicks
  const handleAdminMenuClick = (item) => {
    setIsAdminDropdownOpen(false)
    if (item.action === "logout") {
      handleLogout()
    } else if (item.route) {
      router.push(item.route)
    }
  }


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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Channel Manager</h1>
              <p className="text-sm text-gray-600">Manage your hotel across all booking platforms</p>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === item.id
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

            {/* Admin Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Hotel Manager'}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@hotel.com'}</p>
                    </div>

                    {adminMenuItems.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleAdminMenuClick(item)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${item.id === 'logout' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                            }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === item.id
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

      {/* Click outside to close dropdown */}
      {isAdminDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsAdminDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default HotelChannelManager