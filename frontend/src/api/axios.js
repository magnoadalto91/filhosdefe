import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || '/api'

if (baseURL && !baseURL.startsWith('http://') && !baseURL.startsWith('https://') && !baseURL.startsWith('/')) {
  baseURL = 'https://' + baseURL
}

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
