"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, File, Edit, Trash2, Image, Bed, Users, Clock, Loader2, Edit2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, } from "../../../components/ui/card"

export default function RoomMain() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [floorsLoading, setFloorsLoading] = useState(false);

  const [formData, setFormData] = useState({
    roomId: "",
    name: "",
    description: "",
    noOfRoom: "",
    location: "",
    category: "",
    floor: "",
    amenities: "",
    images: [""],
    price: "",
    gst: "",
    bed: "",
    isAvailable: true,
    balcony: true,
  });

  // Category form data - separate from room form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  // Floor form data - separate from other form data
  const [floorFormData, setFloorFormData] = useState({
    name: "",
    description: "",
  });

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingFloor, setIsEditingFloor] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingFloorId, setEditingFloorId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySuccess, setCategorySuccess] = useState("");
  const [floorError, setFloorError] = useState("");
  const [floorSuccess, setFloorSuccess] = useState("");

  // const [selectedCategory, setSelectedCategory] = useState(null)

  // Mock data
  // const channel = [
  //   { id: "booking-engine", name: "Booking Engine", icon: "🏨" },
  //   { id: "booking-com", name: "Booking.com", icon: "🌐" },
  //   { id: "mmt", name: "MMT", icon: "✈️" },
  //   { id: "agoda", name: "Agoda", icon: "✈️" },
  //   { id: "cleartrip", name: "ClearTrip", icon: "✈️" },
  // ]

  useEffect(() => {
    fetchRooms();
    fetchCategories();
    fetchFloors();
  }, []);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (categoryError) {
      const timer = setTimeout(() => setCategoryError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [categoryError]);

  useEffect(() => {
    if (categorySuccess) {
      const timer = setTimeout(() => setCategorySuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [categorySuccess]);

  useEffect(() => {
    if (floorError) {
      const timer = setTimeout(() => setFloorError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [floorError]);

  useEffect(() => {
    if (floorSuccess) {
      const timer = setTimeout(() => setFloorSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [floorSuccess]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/room");
      const data = await res.json();
      // console.log("rooms", data);

      if (data.success) {
        setRooms(data.data || []);
      } else {
        setError(data.error || "Failed to load rooms");
      }
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      // console.log("categories", data);

      setCategories(data || []);
    } catch (err) {
      setCategoryError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchFloors = async () => {
    setFloorsLoading(true);
    try {
      const response = await fetch("/api/floor");
      const data = await response.json();
      setFloors(data || []);
    } catch (error) {
      console.error("Error fetching floors:", error);
      setFloorError("Failed to load floors");
    } finally {
      setFloorsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value,
    });
  };

  const handleFloorChange = (e) => {
    const { name, value } = e.target;
    setFloorFormData({
      ...floorFormData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { roomId, name, description, noOfRoom, category, images, amenities, price, bed } = formData;

    if (!roomId || !name || !category || !images[0] || !price || !bed) {
      setError("Please fill all required fields");
      return;
    }

    // Prepare data - convert numeric fields and process amenities
    const roomData = {
      ...formData,
      price: parseFloat(price),
      bed: parseInt(bed),
      noOfRoom: parseInt(noOfRoom) || 1,
      // Process amenities: split by comma, trim, and filter empty strings
      amenities: amenities
        ? amenities.split(',').map(item => item.trim()).filter(item => item.length > 0)
        : []
    };

    const url = isEditing ? `/api/room?id=${editingRoomId}` : "/api/room";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message || (isEditing ? "Room updated successfully" : "Room added successfully"));
        resetForm();
        fetchRooms();
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      setError("Failed to save room");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryFormData.name.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    try {
      const url = isEditingCategory ? `/api/category` : "/api/category";
      const method = isEditingCategory ? "PUT" : "POST";

      const requestData = isEditingCategory
        ? { ...categoryFormData, id: editingCategoryId }
        : categoryFormData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setCategorySuccess(isEditingCategory ? "Category updated successfully!" : "Category added successfully!");
        resetCategoryForm();
        fetchCategories();
      } else {
        setCategoryError(data.error || (isEditingCategory ? "Update failed" : "Add failed"));
      }
    } catch (error) {
      console.error("Category operation error:", error);
      setCategoryError(isEditingCategory ? "Failed to update category" : "Failed to add category");
    }
  };

  const handleFloorSubmit = async (e) => {
    e.preventDefault();

    if (!floorFormData.name.trim()) {
      setFloorError("Floor name is required");
      return;
    }

    try {
      const url = `/api/floor`;
      const method = isEditingFloor ? "PUT" : "POST";

      const requestData = isEditingFloor
        ? { ...floorFormData, id: editingFloorId }
        : { name: floorFormData.name, description: floorFormData.description };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setFloorSuccess(isEditingFloor ? "Floor updated successfully!" : "Floor added successfully!");
        resetFloorForm();
        fetchFloors();
      } else {
        setFloorError(data.error || (isEditingFloor ? "Update failed" : "Add failed"));
      }
    } catch (error) {
      console.error("Floor operation error:", error);
      setFloorError(isEditingFloor ? "Failed to update floor" : "Failed to add floor");
    }
  };

  const handleEdit = (room) => {
    setEditingRoomId(room._id);
    setFormData({
      roomId: room.roomId || "",
      name: room.name,
      description: room.description || "",
      location: room.location || "",
      noOfRoom: room.noOfRoom?.toString() || "1",
      category: room.category?._id || "",
      images: room.images?.length > 0 ? room.images : [""],
      // Convert amenities array back to comma-separated string
      amenities: room.amenities && Array.isArray(room.amenities)
        ? room.amenities.join(", ")
        : "",
      price: room.price?.toString() || "",
      bed: room.bed?.toString() || "",
      isAvailable: room.isAvailable !== undefined ? room.isAvailable : true,
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditingCategory(true);
    setIsAddingCategory(true);
  };

  const handleFloorEdit = (floor) => {
    setEditingFloorId(floor._id);
    setFloorFormData({
      name: floor.name,
      description: floor.description || "",
    });
    setIsEditingFloor(true);
    setIsAddingFloor(true);
  };

  const handleDelete = async (room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) return;

    try {
      const res = await fetch(`/api/room?id=${room._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        fetchRooms();
        setSuccess(data.message || "Room deleted successfully");
      } else {
        setError(data.error || "Delete failed");
      }
    } catch (err) {
      setError("Failed to delete");
    }
  };

  const handleCategoryDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/category?id=${category._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchCategories();
        setCategorySuccess("Category deleted successfully!");
      } else {
        setCategoryError(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setCategoryError("Failed to delete category");
    }
  };

  const handleFloorDelete = async (floor) => {
    if (!confirm(`Are you sure you want to delete "${floor.name}"?`)) return;

    try {
      const response = await fetch(`/api/floor?id=${floor._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchFloors();
        setFloorSuccess("Floor deleted successfully!");
      } else {
        setFloorError(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting floor:", error);
      setFloorError("Failed to delete floor");
    }
  };

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    setFormData({ ...formData, images: updated });
  };

  const handleToggleAvailability = async (roomId) => {
    try {
      const res = await fetch(`/api/room?id=${roomId}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (data.success) {
        fetchRooms();
        setSuccess(data.message || "Room availability updated");
      } else {
        setError(data.error || "Failed to toggle availability");
      }
    } catch {
      setError("Failed to toggle availability");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingRoomId(null);
    setFormData({
      roomId: "",
      name: "",
      description: "",
      location: "",
      noOfRoom: "",
      amenities: "",
      category: "",
      images: [""],
      price: "",
      bed: "",
      isAvailable: true,
    });
  };

  const resetCategoryForm = () => {
    setIsAddingCategory(false);
    setIsEditingCategory(false);
    setEditingCategoryId(null);
    setCategoryFormData({
      name: "",
      description: "",
    });
  };

  const resetFloorForm = () => {
    setIsAddingFloor(false);
    setIsEditingFloor(false);
    setEditingFloorId(null);
    setFloorFormData({
      name: "",
      description: "",
    });
  };

  return (
    <div className=" bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
            <p className="text-gray-600 mt-1">Manage your room inventory</p>
          </div>

          {/* Right: Action Buttons */}
          {!isAdding && !isAddingCategory && !isAddingFloor && (
            <div className="flex flex-wrap gap-3">


              <button
                onClick={() => setIsAddingCategory(true)}
                className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Category
              </button>

              <button
                onClick={() => setIsAddingFloor(true)}
                className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Floor
              </button>


              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Room
              </button>



              {/* <Link
                href="/room/import"
                className="flex items-center cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
              >
                <File size={18} className="mr-2" />
                Bulk Import
              </Link> */}
            </div>
          )}
        </header>

        {/* <Card className="mb-6">
          <CardHeader>
            <CardTitle>Channel Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {channel.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all ${selectedCategory === category.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-lg">{category.icon}</div>
                    <h3 className="text-sm font-medium whitespace-nowrap">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Floor Error/Success Messages */}
        {floorError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fade-in">
            <div className="flex items-center">
              <X size={20} className="mr-2" />
              <p className="font-medium">{floorError}</p>
            </div>
          </div>
        )}

        {floorSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm animate-fade-in">
            <div className="flex items-center">
              <Check size={20} className="mr-2" />
              <p className="font-medium">{floorSuccess}</p>
            </div>
          </div>
        )}

        {/* Floor Form Section */}
        <AnimatePresence>
          {isAddingFloor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg mb-6 border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditingFloor ? "Edit Floor" : "Add New Floor"}
                </h2>
                <button
                  onClick={resetFloorForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFloorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={floorFormData.name}
                    onChange={handleFloorChange}
                    required
                    className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter floor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={floorFormData.description}
                    onChange={handleFloorChange}
                    rows={3}
                    className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter floor description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 mb-5">
                  <button
                    type="button"
                    onClick={resetFloorForm}
                    className="cursor-pointer px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    {isEditingFloor ? "Update Floor" : "Add Floor"}
                  </button>
                </div>
              </form>

              {/* Floors Management Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Floor Management</h3>
                </div>

                {floorsLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 size={30} className="animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-600">Loading floors...</span>
                  </div>
                ) : floors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            S.No
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {floors.map((floor, idx) => (
                          <tr key={floor._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{floor.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {floor.description || "—"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => handleFloorEdit(floor)}
                                  className="cursor-pointer text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-1"
                                >
                                  <Edit2 size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleFloorDelete(floor)}
                                  className="cursor-pointer text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">
                      No floors found
                    </p>
                    <p className="text-gray-500 mt-1">
                      Add a new floor to get started
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Category Error/Success Messages */}
        {categoryError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fade-in">
            <div className="flex items-center">
              <X size={20} className="mr-2" />
              <p className="font-medium">{categoryError}</p>
            </div>
          </div>
        )}

        {categorySuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm animate-fade-in">
            <div className="flex items-center">
              <Check size={20} className="mr-2" />
              <p className="font-medium">{categorySuccess}</p>
            </div>
          </div>
        )}

        {/* Category Form Section */}
        <AnimatePresence>
          {isAddingCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg mb-6 border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryChange}
                    required
                    className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryChange}
                    rows={3}
                    className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter category description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 mb-5">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="cursor-pointer px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    {isEditingCategory ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </form>


              {/* Categories Management Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Room Categories</h3>
                </div>

                {categoriesLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 size={30} className="animate-spin text-green-600" />
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                  </div>
                ) : categories.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            S.No
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category, idx) => (
                          <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {category.description || "—"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => handleCategoryEdit(category)}
                                  className="cursor-pointer text-green-600 hover:text-green-900 transition-colors flex items-center gap-1"
                                >
                                  <Edit2 size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(category)}
                                  className="cursor-pointer text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">
                      No categories found
                    </p>
                    <p className="text-gray-500 mt-1">
                      Add a new category to get started
                    </p>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>



        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded"
            >
              <p className="flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 rounded"
            >
              <p className="flex items-center">
                <span className="mr-2">✅</span> {success}
              </p>
            </motion.div>
          )}
        </AnimatePresence>


        {/*Rooms Form Section */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg shadow-md mb-8 overflow-hidden"
            >
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? "Edit Room" : "Add New Room"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room ID *
                    </label>
                    <input
                      type="text"
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleChange}
                      placeholder="Enter room id"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter room name"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Night *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  {/* GST  */}
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst === "" ? "" : Number(formData.gst)}
                    onChange={handleChange}
                    placeholder="Enter GST"
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />


                  {/* Number of Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms *
                    </label>
                    <input
                      type="number"
                      name="noOfRoom"
                      value={formData.noOfRoom}
                      onChange={handleChange}
                      placeholder="Enter number of rooms"
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Bed Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Beds *
                    </label>
                    <input
                      type="number"
                      name="bed"
                      value={formData.bed}
                      onChange={handleChange}
                      placeholder="Enter number of beds"
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border cursor-pointer border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* floor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floors *
                    </label>
                    <select
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border cursor-pointer border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Floor</option>
                      {floors.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                    {/* Availability */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleChange}
                          className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2">
                          {formData.isAvailable ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>


                    {/* balcony */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Balcony
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="balcony"
                          checked={formData.balcony}
                          onChange={handleChange}
                          className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2">
                          {formData.balcony ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter room location"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities
                  </label>
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Enter amenities separated by commas (e.g., WiFi, AC, TV, Parking)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple amenities with commas
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter room description"
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Images Array */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Room Images *
                  </label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 mb-3">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={`Image URL ${index + 1}`}
                        required={index === 0}
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Image
                  </button>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 cursor-pointer text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? "Update Room" : "Save Room"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>







        {/* Room Management Table */}

        <Card>
          {/* <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{channel.find((c) => c.id === selectedCategory)?.name} - Room Management</CardTitle>
            </div>
          </CardHeader> */}
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading rooms...</p>
              </div>
            ) : rooms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr.N
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Id
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Night
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No of Rooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beds
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amenities
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room, idx) => (
                      <motion.tr
                        key={room._id || room.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users size={16} className="mr-1 text-gray-400" />
                            {room.roomId || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {room.name || room.roomName}
                          </div>
                          {/* {room.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {room.description}
                                </div>
                              )} */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.category?.name || room.category || "-"}
                          {/* {
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  Floor: {room.floor?.name}
                                </div>
                              } */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {((room.price || room.pricePerNight) || 0).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            Inc. GST :

                            <span className="font-medium text-gray-900">
                              {(
                                (room.price || 0) +
                                ((room.price || 0) * (room.gst || 0)) / 100
                              ).toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}
                            </span>

                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-gray-400" />
                            {room.noOfRoom || room.noOfRooms || 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Bed size={16} className="mr-1 text-gray-400" />
                            {room.bed || room.beds}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="max-w-xs">
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0
                              ? (
                                <div className="truncate" title={room.amenities.join(", ")}>
                                  {room.amenities.join(", ")}
                                </div>
                              )
                              : <span className="text-gray-400 italic">No amenities</span>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAvailability(room._id || room.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${(room.isAvailable !== undefined ? room.isAvailable : room.status === 'Available')
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                          >
                            {(room.isAvailable !== undefined ? room.isAvailable : room.status === 'Available')
                              ? "Available"
                              : "Unavailable"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(room)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer flex items-center transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(room)}
                              className="text-red-600 cursor-pointer hover:text-red-900 flex items-center transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <Bed size={96} />
                </div>
                <p className="text-gray-500 text-lg font-medium">No rooms found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first room to get started.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Add Your First Room
                </button>
              </div>
            )}
          </CardContent>
        </Card>


      </div >
    </div >
  );
}