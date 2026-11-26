import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await authAPI.getMe()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: state.token
            }
          })
        } catch (error) {
          const errorCode = error.response?.data?.code
          const errorStatus = error.response?.status
          
          // If token is expired, we can't refresh it (refresh requires valid token)
          // Just clear it silently and let user login normally
          if (errorCode === 'TOKEN_EXPIRED') {
            localStorage.removeItem('token')
            // Don't set error message on startup - expired token is normal
            dispatch({ type: 'AUTH_FAILURE', payload: null })
          } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'USER_NOT_FOUND' || errorCode === 'NO_TOKEN') {
            // Invalid token - clear it silently
            localStorage.removeItem('token')
            dispatch({ type: 'AUTH_FAILURE', payload: null })
          } else if (errorStatus === 401) {
            // Other 401 errors - clear token silently
            localStorage.removeItem('token')
            dispatch({ type: 'AUTH_FAILURE', payload: null })
          } else {
            // Network or server errors - don't clear token, just fail silently
            // Token might still be valid, just server unreachable
            console.warn('Auth check failed (non-auth error):', error.message)
            // Don't clear token on network errors - might be temporary
            dispatch({ type: 'AUTH_FAILURE', payload: null })
          }
        }
      } else {
        // No token - this is normal, not an error
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  // Periodic token refresh - refresh token proactively to prevent expiration
  useEffect(() => {
    if (!state.token || !state.isAuthenticated) return

    // Function to decode JWT token and get expiration time
    const getTokenExpiration = (token) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp * 1000 // Convert to milliseconds
      } catch {
        return null
      }
    }

    const refreshTokenIfNeeded = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const expirationTime = getTokenExpiration(token)
        if (!expirationTime) return

        const now = Date.now()
        const timeUntilExpiration = expirationTime - now
        const oneDayInMs = 24 * 60 * 60 * 1000

        // Refresh if token expires within 24 hours
        if (timeUntilExpiration < oneDayInMs && timeUntilExpiration > 0) {
          const response = await authAPI.refreshToken()
          localStorage.setItem('token', response.data.token)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: response.data.token
            }
          })
        }
      } catch (error) {
        console.error('Periodic token refresh failed:', error)
        // Don't logout on periodic refresh failure, let the interceptor handle it
      }
    }

    // Check immediately
    refreshTokenIfNeeded()

    // Then check every hour
    const refreshInterval = setInterval(refreshTokenIfNeeded, 60 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [state.token, state.isAuthenticated])

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.login(email, password)
      localStorage.setItem('token', response.data.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
        }
      })
      return { success: true, user: response.data.user }
    } catch (error) {
      let errorMessage = error.response?.data?.message || 'Login failed'
      
      if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again in a few minutes.'
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return { 
        success: false, 
        error: errorMessage,
        notVerified: error.response?.data?.notVerified,
        email: error.response?.data?.email
      }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.register(userData)
      // We don't dispatch success here because we need OTP verification first
      dispatch({ type: 'CLEAR_ERROR' }) // Clear any previous errors
      return { success: true, message: response.data.message }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const verifyOTP = async (email, otp) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authAPI.verifyOTP(email, otp)
      localStorage.setItem('token', response.data.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const resendOTP = async (email) => {
    try {
      const response = await authAPI.resendOTP(email)
      return { success: true, message: response.data.message }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP'
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
