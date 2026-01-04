import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Upload, Activity, BarChart3, History, User } from 'lucide-react'
import { predictionAPI, authAPI } from '../utils/api'
import { logout } from '../utils/auth'
import ImageUpload from '../components/ImageUpload'
import ResultsDisplay from '../components/ResultsDisplay'

const Dashboard = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
    fetchHistory()
    fetchStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await predictionAPI.getHistory()
      setHistory(response.data.history)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await predictionAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
  }

  const handlePrediction = (result) => {
    setPredictions(result)
    fetchHistory()
    fetchStats()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Doracare</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <Activity className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.total_predictions}</p>
              <p className="text-blue-100">Total Scans</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.most_common_count}</p>
              <p className="text-purple-100">Most Common</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <User className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold truncate">{stats.most_common_disease || 'N/A'}</p>
              <p className="text-pink-100">Top Detection</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5" />
              History
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'upload' ? (
              <div>
                <ImageUpload onPrediction={handlePrediction} setLoading={setLoading} />
                {predictions && !loading && (
                  <ResultsDisplay predictions={predictions} />
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scan History</h3>
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No scans yet. Upload an image to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{item.disease}</p>
                          <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{item.confidence}</p>
                          <p className="text-xs text-gray-500">Confidence</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
