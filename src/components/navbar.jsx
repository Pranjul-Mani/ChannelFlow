"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, User, LogOut, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle logout
    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // User menu items (removed role-based items)
    const userMenuItems = [
        { id: "profile", label: "Profile", icon: User, route: "/admin/profile" },
        { id: "staff", label: "Staff Management", icon: Users, route: "/admin/staff" },
        { id: "logout", label: "Logout", icon: LogOut, action: "logout" },
    ];

    // Handle user menu clicks
    const handleUserMenuClick = (item) => {
        setIsUserDropdownOpen(false);
        if (item.action === "logout") {
            handleLogout();
        } else if (item.route) {
            router.push(item.route);
        }
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`
          fixed top-0 left-0 right-0 z-50 
          flex items-center justify-between px-6 lg:px-8 py-4
          transition-all duration-300 ease-in-out
          bg-slate-900/90 backdrop-blur-lg border-b border-white/10
          ${isScrolled
                        ? 'shadow-2xl shadow-black/20'
                        : 'shadow-lg shadow-black/10'
                    }
        `}
            >
                {/* Logo Section */}
                <div className="flex items-center space-x-2 ml-5">
                    <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                        <img src="/logo.png" alt="logo" />
                    </div>
                    <Link href="/">
                        <span className="text-2xl font-bold text-white">ChannelFlow</span>
                    </Link>
                </div>

                {/* Navigation and Auth Section */}
                <div className="flex items-center space-x-8">
                    <nav className="hidden md:flex items-center space-x-8 mr-20">
                        <Link href="/" className="text-xl text-slate-300 hover:text-white transition-colors duration-200">
                            Home
                        </Link>
                        <Link href="dashboard" className="text-xl text-slate-300 hover:text-white transition-colors duration-200">
                            Dashboard
                        </Link>
                        <Link href="pricing" className="text-xl text-slate-300 hover:text-white transition-colors duration-200">
                            Pricing
                        </Link>
                        <Link href="contact" className="text-xl text-slate-300 hover:text-white transition-colors duration-200">
                            Contact
                        </Link>
                    </nav>

                    {/* Authentication Section */}
                    <div className="flex items-center space-x-3">
                        {isLoading ? (
                            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : user ? (
                            // User is logged in - show dropdown
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-medium text-sm">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-xl font-medium text-white">{user?.name || 'User'}</p>

                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                                        <div className="px-4 py-3 border-b border-slate-700">
                                            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                                            <p className="text-xs text-slate-400">{user?.email || 'user@email.com'}</p>
                                        </div>

                                        {userMenuItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleUserMenuClick(item)}
                                                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-slate-700 transition-colors cursor-pointer ${item.id === 'logout' ? 'text-red-400 hover:bg-red-900/20' : 'text-slate-300 hover:text-white'
                                                        }`}
                                                >
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // User is not logged in - show login button
                            <>
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer bg-cyan-400 hover:bg-cyan-500 text-slate-900 h-9 px-4"
                                    onClick={() => router.push('/login')}
                                >
                                    Login
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.header>

            {/* Click outside to close dropdown */}
            {isUserDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                />
            )}
        </>
    );
}
