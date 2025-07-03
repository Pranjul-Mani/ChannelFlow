// src/components/StaffForm.jsx
"use client"

import { useEffect, useState } from "react"
import { X, Save, User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Building } from "lucide-react"

const StaffForm = ({ editingStaff, onSuccess, onCancel }) => {
    const [form, setForm] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        salary: "",
        joiningDate: ""
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Predefined role options
    const roleOptions = [
        "Manager",
        "Assistant Manager",
        "Team Lead",
        "Senior Developer",
        "Developer",
        "Full Stack Developer",
    ]

    const departmentOptions = [
        "Engineering",
        "Design",
        "Product",
        "Marketing",
    ]

    useEffect(() => {
        if (editingStaff) {
            setForm({
                name: editingStaff.name || "",
                role: editingStaff.role || "",
                email: editingStaff.email || "",
                phone: editingStaff.phone || "",
                address: editingStaff.address || "",
                department: editingStaff.department || "",
                salary: editingStaff.salary || "",
                joiningDate: editingStaff.joiningDate ? editingStaff.joiningDate.split('T')[0] : ""
            })
        } else {
            setForm({
                name: "",
                role: "",
                email: "",
                phone: "",
                address: "",
                department: "",
                salary: "",
                joiningDate: ""
            })
        }
        setErrors({})
    }, [editingStaff])

    const validateForm = () => {
        const newErrors = {}

        if (!form.name.trim()) newErrors.name = "Name is required"
        if (!form.role.trim()) newErrors.role = "Role is required"
        if (!form.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Please enter a valid email address"
        }
        if (!form.phone.trim()) {
            newErrors.phone = "Phone is required"
        } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Please enter a valid 10-digit phone number"
        }
        if (form.salary && (isNaN(form.salary) || Number(form.salary) < 0)) {
            newErrors.salary = "Please enter a valid salary amount"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const method = editingStaff ? "PUT" : "POST"
            const url = editingStaff ? `/api/staff/${editingStaff._id}` : "/api/staff"

            const submitData = {
                ...form,
                salary: form.salary ? Number(form.salary) : undefined
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to save staff member")
            }

            onSuccess()
        } catch (error) {
            console.error("Error saving staff:", error)
            setErrors({ submit: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-500">
                <div className="relative p-6">

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.submit && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3">
                                <p className="text-red-800 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <User className="h-4 w-4 mr-1 text-blue-500" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-blue-300"
                                        }`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Briefcase className="h-4 w-4 mr-1 text-purple-500" />
                                    Role *
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.role ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-purple-300"
                                        }`}
                                >
                                    <option value="">Select a role</option>
                                    {roleOptions.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="h-4 w-4 mr-1 text-green-500" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-green-300"
                                        }`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Phone className="h-4 w-4 mr-1 text-orange-500" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-orange-300"
                                        }`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <MapPin className="h-4 w-4 mr-1 text-teal-500" />
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none hover:border-teal-300"
                            />
                        </div>

                        {/* Work Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Building className="h-4 w-4 mr-1 text-indigo-500" />
                                    Department
                                </label>
                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                                >
                                    <option value="">Select department</option>
                                    {departmentOptions.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="h-4 w-4 mr-1 text-pink-500" />
                                    Joining Date
                                </label>
                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={form.joiningDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    {/* <DollarSign className="h-4 w-4 mr-1 text-emerald-500" /> */}
                                    Salary (₹)
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={form.salary}
                                    onChange={handleChange}
                                    placeholder="Monthly salary"
                                    min="0"
                                    step="1000"
                                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.salary ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-emerald-300"
                                        }`}
                                />
                                {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium hover:border-gray-400"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className=" cursor-pointer inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {editingStaff ? "Updating..." : "Adding..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {editingStaff ? "Update Staff" : "Add Staff"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default StaffForm