// src/app/admin/staff/page.jsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StaffForm from "@/components/StaffForm"
import { Trash2, Edit, Plus, Users, Mail, Phone, MapPin, Calendar, Search, Filter, ArrowLeft } from "lucide-react"

const StaffManagement = () => {
    const router = useRouter()
    const [staff, setStaff] = useState([])
    const [editingStaff, setEditingStaff] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")

    const fetchStaff = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/staff")
            const data = await res.json()
            setStaff(data)
        } catch (error) {
            console.error("Error fetching staff:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStaff()
    }, [])

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this staff member?")) return

        try {
            await fetch(`/api/staff/${id}`, { method: "DELETE" })
            fetchStaff()
        } catch (error) {
            console.error("Error deleting staff:", error)
        }
    }

    const handleEdit = (member) => {
        setEditingStaff(member)
        setShowForm(true)
    }

    const handleAddNew = () => {
        setEditingStaff(null)
        setShowForm(true)
    }

    const handleFormSuccess = () => {
        fetchStaff()
        setShowForm(false)
        setEditingStaff(null)
    }

    const handleBackToHome = () => {
        router.push("/")
    }

    // Filter and search logic
    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === "all" || member.role === filterRole
        return matchesSearch && matchesRole
    })

    const uniqueRoles = [...new Set(staff.map(member => member.role))]

    // Function to determine status (you can customize this logic)
    // const getStatus = (member) => {
    //     // Example logic - you can modify based on your needs
    //     return member.status || "Active" // Default to Active if no status field
    // }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToHome}
                        className="cursor-pointer inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </button>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                                <p className="text-gray-600">{staff.length} staff members</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="cursor-pointer mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Staff
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search staff by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="all">All Roles</option>
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Staff Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-white/90 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                                </h2>
                            </div>
                            <div className="p-6">
                                <StaffForm
                                    editingStaff={editingStaff}
                                    onSuccess={handleFormSuccess}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Staff Table */}
                {filteredStaff.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterRole !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "Get started by adding your first staff member"
                            }
                        </p>
                        {!searchTerm && filterRole === "all" && (
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Staff Member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Join Date
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th> */}
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStaff.map((member) => (
                                        <tr key={member._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {member.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === "Manager" ? "bg-purple-100 text-purple-800" :
                                                    member.role === "Developer" ? "bg-blue-100 text-blue-800" :
                                                        member.role === "Designer" ? "bg-green-100 text-green-800" :
                                                            member.role === "HR" ? "bg-orange-100 text-orange-800" :
                                                                member.role === "Receptionist" ? "bg-pink-100 text-pink-800" :
                                                                    member.role === "Housekeeping Manager" ? "bg-yellow-100 text-yellow-800" :
                                                                        member.role === "Night Auditor" ? "bg-indigo-100 text-indigo-800" :
                                                                            "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.department || "—"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : "—"}
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatus(member) === "Active" ? "bg-green-100 text-green-800" :
                                                    getStatus(member) === "Inactive" ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {getStatus(member)}
                                                </span>
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className=" cursor-pointer p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                        title="Edit staff member"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member._id)}
                                                        className=" cursor-pointer p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                        title="Delete staff member"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StaffManagement