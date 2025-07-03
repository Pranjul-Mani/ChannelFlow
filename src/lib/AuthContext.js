"use client"

import { createContext, useContext, useReducer, useEffect } from 'react'

// Auth Context
const AuthContext = createContext()

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

// Auth API functions
const authAPI = {
  login: async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    return response.json()
  },

  signup: async (userData) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }
    
    return response.json()
  },

  verifyToken: async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) return null
    
    return response.json()
  },

  logout: async () => {
    localStorage.removeItem('token')
    // Optionally call logout endpoint
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
  }
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.verifyToken()
        if (userData) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: userData.user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('token', data.token)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Signup function
  const signup = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const data = await authAPI.signup(userData)
      localStorage.setItem('token', data.token)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Logout error:', error)
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based access control
export const usePermissions = () => {
  const { user } = useAuth()
  
  const permissions = {
    // Admin permissions
    admin: {
      dashboard: { read: true, write: true },
      inventory: { read: true, write: true },
      calendar: { read: true, write: true },
      bookings: { read: true, write: true, cancel: true },
      settings: { read: true, write: true },
      users: { read: true, write: true, delete: true },
      reports: { read: true, write: true }
    },
    
    // Staff permissions
    staff: {
      dashboard: { read: true, write: false },
      inventory: { read: true, write: true },
      calendar: { read: true, write: true },
      bookings: { read: true, write: true, cancel: false },
      settings: { read: false, write: false },
      users: { read: false, write: false, delete: false },
      reports: { read: true, write: false }
    },
    
  
  }
  
  const hasPermission = (module, action) => {
    if (!user) return false
    const userRole = user.role || 'staff'
    return permissions[userRole]?.[module]?.[action] || false
  }
  
  const canAccess = (module) => {
    return hasPermission(module, 'read')
  }
  
  return {
    hasPermission,
    canAccess,
    userRole: user?.role || null
  }
}