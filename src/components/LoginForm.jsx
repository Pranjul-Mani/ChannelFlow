"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const LoginForm = ({ onToggleForm }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  // const [rememberMe, setRememberMe] = useState(false)
  const [userNotFoundEmail, setUserNotFoundEmail] = useState('')

  const { login, isLoading, error, clearError, user } = useAuth()

  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

 
  // Auto-redirect to signup if user not found
  useEffect(() => {
    if (error && (
      error.includes('User not found') ||
      error.includes('Invalid credentials') ||
      error.includes('No account found')
    )) {
      // Store the email for pre-filling in signup form
      setUserNotFoundEmail(formData.email)

      // Show a brief message before redirecting
      setTimeout(() => {
        onToggleForm(formData.email) // Pass email to signup form
      }, 2000) // 2 second delay to show the message
    }
  }, [error, formData.email, onToggleForm])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData.email, formData.password)

    if (result.success) {
      // Redirect to dashboard after successful login
      router.push('/')
    }
  }

  // Check if error indicates user not found
  const isUserNotFoundError = error && (
    error.includes('User not found') ||
    error.includes('Invalid credentials') ||
    error.includes('No account found')
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          {/* <p className="text-gray-600">Sign in to your hotel management account</p> */}
        </div>

        {/* Error Message with Redirect Info */}
        {error && (
          <div className={`mb-6 p-4 border rounded-lg flex items-center space-x-2 ${isUserNotFoundError
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
            }`}>
            <AlertCircle className={`h-5 w-5 ${isUserNotFoundError ? 'text-amber-500' : 'text-red-500'
              }`} />
            <div className="flex-1">
              <span className={`text-sm ${isUserNotFoundError ? 'text-amber-700' : 'text-red-700'
                }`}>
                {isUserNotFoundError
                  ? 'Account not found. Redirecting to sign up...'
                  : error
                }
              </span>
              {isUserNotFoundError && (
                <div className="mt-2">
                  <div className="w-full bg-amber-200 rounded-full h-1">
                    <div className="bg-amber-500 h-1 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isUserNotFoundError}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isUserNotFoundError ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isUserNotFoundError}
                className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isUserNotFoundError ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isUserNotFoundError}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isUserNotFoundError}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : isUserNotFoundError ? (
              'Redirecting to Sign Up...'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => onToggleForm()}
              className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
              disabled={isUserNotFoundError}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm