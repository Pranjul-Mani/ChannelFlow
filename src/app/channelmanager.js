"use client"

import React, { useState } from "react"
import { Bell, TrendingUp, Calendar, Package, BookOpen, Settings } from "lucide-react"
import Dashboard from "../components/dashboard"
import Inventory from "../components/inventory"
import CalendarView from "../components/calendar-view"
import Bookings from "../components/bookings"


const HotelChannelManager = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])


  // Mock data for channels
  const [channels] = useState([])


  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-50" },
    // Header
    React.createElement(
      "header",
      { className: "bg-white shadow-sm border-b border-gray-200" },
      React.createElement(
        "div",
        { className: "px-6 py-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          React.createElement(
            "div",
            null,
            React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Hotel Channel Manager"),
            React.createElement(
              "p",
              { className: "text-sm text-gray-600" },
              "Manage your hotel across all booking platforms",
            ),
          ),
          React.createElement(
            "div",
            { className: "flex items-center space-x-4" },
            
            React.createElement(
              "div",
              {
                className:
                  "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm",
              },
              "H",
            ),
          ),
        ),
      ),
    ),

    React.createElement(
      "div",
      { className: "flex" },
      // Sidebar
      React.createElement(
        "nav",
        { className: "w-64 bg-white shadow-sm min-h-screen" },
        React.createElement(
          "div",
          { className: "p-6" },
          React.createElement(
            "div",
            { className: "space-y-2" },
            // Dashboard Button
            React.createElement(
              "button",
              {
                onClick: () => setActiveTab("dashboard"),
                className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`,
              },
              React.createElement(TrendingUp, { className: "h-5 w-5" }),
              React.createElement("span", { className: "font-medium" }, "Dashboard"),
            ),
            
            // Calendar Button
            React.createElement(
              "button",
              {
                onClick: () => setActiveTab("calendar"),
                className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "calendar"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`,
              },
              React.createElement(Calendar, { className: "h-5 w-5" }),
              React.createElement("span", { className: "font-medium" }, "Calendar"),
            ),

            // Inventory Button
            React.createElement(
              "button",
              {
                onClick: () => setActiveTab("inventory"),
                className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "inventory"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`,
              },
              React.createElement(Package, { className: "h-5 w-5" }),
              React.createElement("span", { className: "font-medium" }, "Inventory"),
            ),

            // Bookings Button
            React.createElement(
              "button",
              {
                onClick: () => setActiveTab("bookings"),
                className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "bookings"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`,
              },
              React.createElement(BookOpen, { className: "h-5 w-5" }),
              React.createElement("span", { className: "font-medium" }, "Bookings"),
            ),

            // Settings Button
            React.createElement(
              "button",
              {
                onClick: () => setActiveTab("settings"),
                className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "settings"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`,
              },
              React.createElement(Settings, { className: "h-5 w-5" }),
              React.createElement("span", { className: "font-medium" }, "Settings"),
            ),
          ),
        ),
      ),

      // Main Content
      React.createElement(
        "main",
        { className: "flex-1 p-6" },
        activeTab === "dashboard" && React.createElement(Dashboard, { channels }),
        activeTab === "calendar" && React.createElement(CalendarView),
        activeTab === "inventory" && React.createElement(Inventory, { roomTypes, selectedDate, setSelectedDate }),
        activeTab === "bookings" && React.createElement(Bookings),
        activeTab === "settings" &&
          React.createElement(
            "div",
            { className: "bg-white rounded-xl shadow-lg p-6" },
            React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Channel Settings"),
            React.createElement(
              "p",
              { className: "text-gray-600" },
              "Configure your channel connections and preferences here.",
            ),
          ),
      ),
    ),

    
  )
}

export default HotelChannelManager
