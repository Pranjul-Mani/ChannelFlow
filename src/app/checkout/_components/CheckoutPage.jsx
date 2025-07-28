"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Bed, CreditCard, AlertCircle, LogIn, CheckCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    personDetails: [{ name: '', age: 18 }]
  });
  const [errors, setErrors] = useState({});
  
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  // Check JWT authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verify token with your API
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user || userData.data);
          setIsAuthenticated(true);
        } else {
          console.log('Auth verification failed:', response.status);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch room details from API
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) {
        setRoomLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/room?id=${roomId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch room data');
        }
        
        const roomData = await response.json();
        setRoom(roomData.data);
      } catch (error) {
        console.error('Error fetching room data:', error);
        setRoom(null);
      } finally {
        setRoomLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRoomData();
    }
  }, [roomId, isAuthenticated]);

  const handleRoomQuantityChange = (quantity) => {
    if (!room || quantity > room.noOfRoom || quantity < 1) return;
    
    const maxPersonsPerRoom = room.bed * 2; // 2 persons per bed
    const totalMaxPersons = quantity * maxPersonsPerRoom;
    
    // Adjust person details array
    const newPersonDetails = Array.from({ length: totalMaxPersons }, (_, i) => 
      bookingData.personDetails[i] || { name: '', age: 18 }
    );
    
    setBookingData(prev => ({
      ...prev,
      numberOfRooms: quantity,
      personDetails: newPersonDetails
    }));
  };

  const handlePersonDetailChange = (index, field, value) => {
    setBookingData(prev => ({
      ...prev,
      personDetails: prev.personDetails.map((person, i) => 
        i === index 
          ? { ...person, [field]: field === 'age' ? parseInt(value) || 0 : value }
          : person
      )
    }));
  };

  const calculateTotal = () => {
    if (!room || !bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    
    const days = Math.ceil(
      (new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24)
    );
    
    return room.price * days * bookingData.numberOfRooms;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    
    if (!bookingData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }
    
    if (bookingData.checkInDate && bookingData.checkOutDate) {
      if (new Date(bookingData.checkInDate) >= new Date(bookingData.checkOutDate)) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
      
      if (new Date(bookingData.checkInDate) < new Date().setHours(0, 0, 0, 0)) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
    }
    
    // Validate person details - at least one person required
    const validPersons = bookingData.personDetails.filter(person => person.name.trim());
    
    if (validPersons.length === 0) {
      newErrors.personData = 'At least one person name is required';
    }
    
    // Validate ages for valid names
    bookingData.personDetails.forEach((person, index) => {
      if (person.name.trim()) {
        if (!person.age || person.age < 1 || person.age > 120) {
          newErrors.personData = 'Please enter valid ages (1-120) for all guests';
        }
      }
    });
    
    // Check if persons exceed bed capacity
    if (room) {
      const maxPersonsAllowed = bookingData.numberOfRooms * room.bed * 2;
      if (validPersons.length > maxPersonsAllowed) {
        newErrors.personData = `Maximum ${maxPersonsAllowed} persons allowed for ${bookingData.numberOfRooms} room(s)`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Filter out empty person details
      const validPersonDetails = bookingData.personDetails
        .filter(person => person.name.trim())
        .map(person => ({
          name: person.name.trim(),
          age: person.age
        }));

      // Format the booking payload according to the API structure
      const bookingPayload = {
        rooms: [
          {
            roomId: room._id,
            numberOfRooms: bookingData.numberOfRooms
          }
        ],
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        personDetails: validPersonDetails,
        totalAmount: calculateTotal()
      };
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Show success message
        alert(`Booking confirmed successfully! Booking Reference: ${result.booking.bookingReference}`);
        // Redirect to booking confirmation page
        router.push(`/booking-confirmation/${result.booking._id}`);
      } else {
        // Show error message from API
        alert(result.message || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while processing your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <LogIn className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to your account to complete the booking process.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading while fetching room data
  if (roomLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  // Show error if room not found
  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <p className="text-gray-600 mb-6">
            The room you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Other Rooms
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const days = bookingData.checkInDate && bookingData.checkOutDate 
    ? Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const maxPersonsPerRoom = room.bed * 2;
  const maxTotalPersons = bookingData.numberOfRooms * maxPersonsPerRoom;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-black ">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Complete Your Booking
          </h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Room Details */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={room.images?.[0] || '/placeholder-room.jpg'} 
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold">{room.name}</h2>
                  <p className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {room.location}
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Bed className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{room.bed} Beds (Max {maxPersonsPerRoom} persons/room)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{room.noOfRoom} Rooms Available</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Price per night</span>
                    <span className="text-2xl font-bold text-blue-600">${room.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-6">
                {/* User Info Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking for:</h3>
                  <p className="text-gray-700">{user?.name || 'User'}</p>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                  {user?.phone && <p className="text-gray-600 text-sm">{user.phone}</p>}
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Select Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkInDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkInDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.checkInDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.checkInDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.checkInDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkOutDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                        min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.checkOutDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.checkOutDate}</p>
                      )}
                    </div>
                  </div>
                  {days > 0 && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">
                      {days} night{days > 1 ? 's' : ''} stay
                    </p>
                  )}
                </div>

                {/* Number of Rooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleRoomQuantityChange(bookingData.numberOfRooms - 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold px-4">{bookingData.numberOfRooms}</span>
                    <button
                      type="button"
                      onClick={() => handleRoomQuantityChange(bookingData.numberOfRooms + 1)}
                      disabled={bookingData.numberOfRooms >= room.noOfRoom}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {room.noOfRoom} rooms | Max capacity: {maxTotalPersons} persons
                  </p>
                </div>

                {/* Guest Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Guest Information
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {bookingData.personDetails.map((person, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Guest {index + 1} {index === 0 && '(Primary)'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={person.name}
                              onChange={(e) => handlePersonDetailChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder={`Enter guest ${index + 1} name`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              value={person.age || ''}
                              onChange={(e) => handlePersonDetailChange(index, 'age', e.target.value)}
                              min="1"
                              max="120"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Age"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.personData && (
                    <p className="text-red-500 text-sm mt-2">{errors.personData}</p>
                  )}
                </div>

                {/* Booking Summary */}
                {totalAmount > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Room: {room.name}</span>
                        <span>{bookingData.numberOfRooms} room{bookingData.numberOfRooms > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{days} night{days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per night:</span>
                        <span>${room.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guests:</span>
                        <span>{bookingData.personDetails.filter(p => p.name.trim()).length} person{bookingData.personDetails.filter(p => p.name.trim()).length > 1 ? 's' : ''}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">${totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !totalAmount}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                    submitting || !totalAmount
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Booking...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Confirm Booking - ${totalAmount}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By confirming your booking, you agree to our terms and conditions.
                  Your booking will be confirmed instantly and you'll receive a confirmation email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;