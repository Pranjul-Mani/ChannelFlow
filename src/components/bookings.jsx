"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Calendar, ChevronDown, Filter, Home, Info, MapPin, Shield, User, Mail, X, Tag, Star, Bed, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"
import { Checkbox } from "./ui/checkbox"

export default function HotelBookingPage() {
  // Date states
  const [checkInDate, setCheckInDate] = useState(new Date(2025, 5, 26))
  const [checkOutDate, setCheckOutDate] = useState(new Date(2025, 5, 27))
  const [showPromoCode, setShowPromoCode] = useState(false)
  const [selectedView, setSelectedView] = useState("Per Room Per Night")

  // Room data states from first file
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [visibleRooms, setVisibleRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Lazy loading states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const ROOMS_PER_PAGE = 9;
  const loadingMoreRef = useRef(false);

  // Comparison and booking states
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [compareRooms, setCompareRooms] = useState([]);

  // Last element ref for intersection observer
  const lastRoomRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreRooms();
          }
        },
        {
          rootMargin: "200px",
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  // Load more rooms when scrolling
  const loadMoreRooms = () => {
    if (loadingMoreRef.current) return;

    if (page * ROOMS_PER_PAGE >= filteredRooms.length) {
      setHasMore(false);
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    setTimeout(() => {
      const nextPage = page + 1;
      const nextVisibleRooms = filteredRooms.slice(
        0,
        nextPage * ROOMS_PER_PAGE
      );
      setVisibleRooms(nextVisibleRooms);
      setPage(nextPage);

      setHasMore(nextPage * ROOMS_PER_PAGE < filteredRooms.length);
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }, 300);
  };

  // Fetch rooms and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch rooms
        const roomsRes = await fetch("/api/room");
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (roomsData.success) {
            setRooms(roomsData.data);
            setFilteredRooms(roomsData.data);
            setVisibleRooms(roomsData.data.slice(0, ROOMS_PER_PAGE));
          }
        }

        // Fetch categories
        const categoriesRes = await fetch("/api/category");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, sortBy, rooms]);

  // Reset pagination when filtered rooms change
  useEffect(() => {
    setPage(1);
    setHasMore(filteredRooms.length > ROOMS_PER_PAGE);
    setVisibleRooms(filteredRooms.slice(0, ROOMS_PER_PAGE));
    loadingMoreRef.current = false;
  }, [filteredRooms]);

  // Apply all filters and sorting logic
  const applyFilters = () => {
    let result = [...rooms];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (room.description &&
            room.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (room.location &&
            room.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(
        (room) => room.category && room.category._id === selectedCategory
      );
    }

    // Apply price range filter
    result = result.filter(
      (room) => room.price >= priceRange.min && room.price <= priceRange.max
    );

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort(
          (a, b) =>
            calculateAverageRating(b.reviews) -
            calculateAverageRating(a.reviews)
        );
        break;
      default:
        break;
    }

    setFilteredRooms(result);
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return `₹${price?.toLocaleString("en-IN") || "0"}`;
  };

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    if (typeof reviews[0] === "object" && reviews[0].rating) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / reviews.length;
    }
    return 4.5;
  };

  // Calculate nights between dates
  const calculateNights = () => {
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Handle room comparison
  const handleCompareToggle = (room) => {
    setCompareRooms(prev => {
      const isAlreadyComparing = prev.find(r => r._id === room._id);
      if (isAlreadyComparing) {
        return prev.filter(r => r._id !== room._id);
      } else {
        if (prev.length >= 3) {
          // Limit to 3 rooms for comparison
          return prev;
        }
        return [...prev, room];
      }
    });
  };

  // Format date helper
  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Calculate total booking summary
  const calculateBookingSummary = () => {
    const nights = calculateNights();
    let totalAmount = 0;
    let totalRooms = selectedRooms.length;

    selectedRooms.forEach(room => {
      const roomPrice = selectedView === "Per Room Per Night" ? room.price : room.price * nights;
      totalAmount += roomPrice;
    });

    return { totalAmount, totalRooms, nights };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">


      {/* Hero Section with Booking Form */}
      <div className="relative h-[300px] overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600">
        <div className="absolute inset-0 bg-black/30" />

        {/* Search and Booking Form Overlay */}
        <div className="absolute left-4 lg:left-96 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-6 rounded-lg text-white max-w-lg w-full lg:w-auto">
          {/* Search Bar */}
          <div className="mb-4">
            <Label className="text-white mb-2 block">Search Rooms</Label>
            <Input
              type="text"
              placeholder="Search by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-white mb-2 block">Check In</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-white text-black hover:bg-gray-100">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(checkInDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => date && setCheckInDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-white mb-2 block">Check Out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-white text-black hover:bg-gray-100">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(checkOutDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => date && setCheckOutDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button className="w-full mb-3 bg-orange-600 hover:bg-orange-700">Check Availability</Button>

          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/20 flex items-center gap-2"
            onClick={() => setShowPromoCode(!showPromoCode)}
          >
            <Tag className="w-4 h-4" />
            Promotional Code
          </Button>

          {showPromoCode && <Input placeholder="Enter promotional code" className="mt-2 bg-white text-black" />}
        </div>
      </div>

      {/* Room Selection Interface */}
      <div className="bg-slate-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700 flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Filter Your Search'}
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
              Compare Rooms ({compareRooms.length}/3)
            </Button>
            <span className="text-sm">Rates are in INR ( Rs )</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">Show Price :</span>
            <div className="flex bg-slate-700 rounded">
              <Button
                variant={selectedView === "Per Room Per Night" ? "default" : "ghost"}
                size="sm"
                className={
                  selectedView === "Per Room Per Night"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "text-white hover:bg-slate-600"
                }
                onClick={() => setSelectedView("Per Room Per Night")}
              >
                Per Room Per Night
              </Button>
              <Button
                variant={selectedView === "Price For Whole Stay" ? "default" : "ghost"}
                size="sm"
                className={
                  selectedView === "Price For Whole Stay"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "text-white hover:bg-slate-600"
                }
                onClick={() => setSelectedView("Price For Whole Stay")}
              >
                Price For Whole Stay
              </Button>
            </div>
            <Button variant="outline" size="sm" className="bg-white text-black hover:bg-gray-100">
              Booking Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-gray-100 py-4 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label>Category:</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Min Price:</Label>
                <Input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label>Max Price:</Label>
                <Input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label>Sort by:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setPriceRange({ min: 0, max: 10000 });
                  setSortBy("newest");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Room Listings */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Rooms</h2>
              <p className="text-gray-600">
                Showing {filteredRooms.length} of {rooms.length} rooms for {calculateNights()} night(s)
              </p>
            </div>

            {filteredRooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-gray-700">No rooms found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              visibleRooms.map((room, index) => {
                const avgRating = calculateAverageRating(room.reviews);
                const nights = calculateNights();
                const roomPrice = selectedView === "Per Room Per Night" ? room.price : room.price * nights;
                const isLastItem = index === visibleRooms.length - 1 && hasMore;
                const isComparing = compareRooms.find(r => r._id === room._id);

                return (
                  <Card key={room._id} ref={isLastItem ? lastRoomRef : null} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-[300px_1fr] gap-6">
                        <div className="relative h-48 md:h-full">
                          {room.images && room.images.length > 0 ? (
                            <img
                              src={room.images[0]}
                              alt={room.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Bed className="w-16 h-16 text-gray-400" />
                            </div>
                          )}


                          {/* Availability badge */}
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${room.isAvailable
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                                }`}
                            >
                              {room.isAvailable ? "Available" : "Booked"}
                            </span>
                          </div>

                          {/* Category badge */}
                          {room.category && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {room.category.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">
                                {room.name.charAt(0).toUpperCase() + room.name.slice(1)}
                              </h3>

                              {room.location && (
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="text-sm">{room.location}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  Room Capacity: {room.noOfRoom || 2}
                                  <Users className="w-4 h-4 ml-1" />
                                </span>
                                {room.bed && (
                                  <span className="flex items-center gap-1">
                                    <Bed className="w-4 h-4" />
                                    {room.bed} Bed(s)
                                  </span>
                                )}
                              </div>

                              {avgRating > 0 && (
                                <div className="flex items-center mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < avgRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                  <span className="ml-1 text-sm text-gray-600">
                                    ({avgRating.toFixed(1)})
                                  </span>
                                </div>
                              )}

                              <p className="text-sm text-muted-foreground">Room Rates Exclusive of Tax</p>
                            </div>

                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold">{formatPrice(roomPrice)}</div>
                              <div className="text-sm text-muted-foreground">
                                {selectedView === "Per Room Per Night" ? "Price for 1 Night" : `Price for ${nights} Night(s)`}
                              </div>
                              <div className="text-sm text-muted-foreground">2 Adults, 0 Child, 1 Room</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`compare-${room._id}`}
                                checked={!!isComparing}
                                onCheckedChange={() => handleCompareToggle(room)}
                                disabled={!isComparing && compareRooms.length >= 3}
                              />
                              <Label htmlFor={`compare-${room._id}`} className="text-sm">
                                Add To Compare
                              </Label>
                            </div>

                            {room.isAvailable ? (
                              <Link href={`/checkout/${room._id}`}>
                                <Button className="bg-orange-600 hover:bg-orange-700">Book Now</Button>
                              </Link>
                            ) : (
                              <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                                Unavailable
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Load more button */}
            {hasMore && filteredRooms.length > visibleRooms.length && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreRooms}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More Rooms"}
                </Button>
              </div>
            )}

            {/* Loading indicator */}
            {loadingMore && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedRooms.length > 0 ? `Booking Summary (${selectedRooms.length} Room(s))` : "No Room(s) Selected"}
                </h3>

                {selectedRooms.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Select rooms to see booking summary</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span>{formatDate(checkInDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span>{formatDate(checkOutDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>{calculateNights()}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      {selectedRooms.map(room => (
                        <div key={room._id} className="flex justify-between text-sm mb-2">
                          <span>{room.name}</span>
                          <span>{formatPrice(selectedView === "Per Room Per Night" ? room.price : room.price * calculateNights())}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>{formatPrice(calculateBookingSummary().totalAmount)}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </CardContent >
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}
