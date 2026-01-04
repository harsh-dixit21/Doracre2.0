import axios from 'axios'
import { getUserToken } from './auth'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Firebase token to requests
api.interceptors.request.use(async (config) => {
  const token = await getUserToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth-related calls (if you still hit Flask auth endpoints)
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  verifyToken: () => api.get('/auth/verify'),
}

export const predictionAPI = {
  uploadImage: (formData) => {
    return api.post('/predict/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getHistory: () => api.get('/predict/history'),
  getStats: () => api.get('/predict/stats'),
}

export default api
