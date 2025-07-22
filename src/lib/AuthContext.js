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
    const token = localStorage.getItem('token')
    localStorage.removeItem('token')
    localStorage.removeItem('user') // Remove user data too
    
    // Optionally call logout endpoint
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Logout endpoint error:', error)
      }
    }
  }
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have stored user data
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (storedUser && token) {
          // Parse and use stored user data immediately
          const userData = JSON.parse(storedUser)
          dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
        } else {
          // If no stored data, try to verify token
          const response = await authAPI.verifyToken()
          if (response && response.user) {
            // Store user data for persistence
            localStorage.setItem('user', JSON.stringify(response.user))
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.user })
          } else {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
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
      localStorage.setItem('user', JSON.stringify(data.user)) // Store user data
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
      localStorage.setItem('user', JSON.stringify(data.user)) // Store user data
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

// Simplified permissions (removed role-based logic since roles are removed)
export const usePermissions = () => {
  const { user } = useAuth()
  
  const permissions = {
    dashboard: { read: true, write: true },
    inventory: { read: true, write: true },
    calendar: { read: true, write: true },
    bookings: { read: true, write: true, cancel: true },
    settings: { read: true, write: true },
    users: { read: true, write: true, delete: true },
    reports: { read: true, write: true }
  }
  
  const hasPermission = (module, action) => {
    if (!user) return false
    return permissions[module]?.[action] || false
  }
  
  const canAccess = (module) => {
    return hasPermission(module, 'read')
  }
  
  return {
    hasPermission,
    canAccess,
    isAuthenticated: !!user
  }
}
