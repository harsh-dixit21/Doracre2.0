import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, BarChart3, Image as ImageIcon } from 'lucide-react'

const ResultsDisplay = ({ predictions }) => {
  const API_BASE = 'http://localhost:5000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6"
    >
      {/* Primary Detection */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Analysis Complete</h4>
            <p className="text-gray-700 mb-3">{predictions.message}</p>
            {predictions.primary_detection && (
              <div className="bg-white rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600 mb-1">Primary Detection</p>
                <p className="text-2xl font-bold text-green-600">
                  {predictions.primary_detection.disease}
                </p>
                <p className="text-sm text-gray-500">
                  Confidence: {predictions.primary_detection.confidence}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Detections */}
      {predictions.predictions && predictions.predictions.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            All Detections ({predictions.predictions.length})
          </h4>
          <div className="space-y-3">
            {predictions.predictions.map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{pred.class_name}</p>
                    <p className="text-sm text-gray-500">Class ID: {pred.class_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {(pred.confidence * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Visualizations */}
      <div className="grid md:grid-cols-2 gap-6">
        {predictions.visualization_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Detection Visualization
            </h4>
            <img
              src={`${API_BASE}${predictions.visualization_url}`}
              alt="Detection Result"
              className="w-full rounded-lg"
            />
          </motion.div>
        )}

        {predictions.chart_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Confidence Chart
            </h4>
            <img
              src={`${API_BASE}${predictions.chart_url}`}
              alt="Confidence Chart"
              className="w-full rounded-lg"
            />
          </motion.div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only 
            and should not replace professional medical advice. Please consult a dermatologist for 
            proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ResultsDisplay
